// Note-Editor.c
// Stack-powered note editor with peekable logs and jumpable undo/redo.
// Portable C99, MinGW-friendly (no localtime_s required).
//
// Build (MinGW / GCC):  gcc -std=c99 -O2 -Wall -Wextra -o stack_note Note-Editor.c
// Run:                  ./stack_note
//
// Commands:
//   type <text>        Replace entire note (staged)
//   append <text>      Append newline + <text> (staged)
//   commit             Snapshot the staged text
//   show               Print current note
//   -peek              Show all logs
//   -since <n>         Show last n logs
//   -goto <k>          Jump to step k
//   -undo / -redo      Move one step back/forward
//   export <file.json> Export logs (with content) to JSON
//   reset              Clear everything
//   help               List commands
//   quit               Exit

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <ctype.h>

// ------------------------------- Utilities -------------------------------

static void die_oom(void) {
    fprintf(stderr, "Out of memory\n");
    exit(1);
}

static char* xstrdup(const char* s) {
    if (!s) return NULL;
    size_t n = strlen(s) + 1;
    char* p = (char*)malloc(n);
    if (!p) die_oom();
    memcpy(p, s, n);
    return p;
}

static void* xrealloc(void* p, size_t n) {
    void* q = realloc(p, n);
    if (!q) die_oom();
    return q;
}

static void rstrip(char* s) {
    if (!s) return;
    size_t n = strlen(s);
    while (n && (s[n-1] == '\n' || s[n-1] == '\r')) s[--n] = '\0';
}

// Portable timestamp: MSVC→localtime_s, POSIX→localtime_r, MinGW→localtime.
static char* timestamp_now(void) {
    time_t t = time(NULL);
    struct tm tm_;
#if defined(_WIN32) && !defined(__MINGW32__) && !defined(__MINGW64__)
    localtime_s(&tm_, &t);
#elif defined(__MINGW32__) || defined(__MINGW64__)
    struct tm* ptm = localtime(&t);
    if (!ptm) { fprintf(stderr, "localtime failed\n"); exit(1); }
    tm_ = *ptm;
#else
    localtime_r(&t, &tm_);
#endif
    char buf[64];
    if (strftime(buf, sizeof(buf), "%Y-%m-%d %H:%M:%S", &tm_) == 0) {
        return xstrdup("0000-00-00 00:00:00");
    }
    return xstrdup(buf);
}

// ------------------------------- Data Types -------------------------------

typedef struct {
    char* content;   // full note content at this step
    char* ts;        // timestamp
    char  op[12];    // "init" or "commit"
    int   delta;     // len(now) - len(prev)
    int   len;       // strlen(content)
} Snapshot;

typedef struct {
    Snapshot* a;
    size_t    n;
    size_t    cap;
} SnapVec;

static void snapvec_init(SnapVec* v) { v->a = NULL; v->n = 0; v->cap = 0; }
static void snapvec_reserve(SnapVec* v, size_t need) {
    if (need <= v->cap) return;
    size_t newcap = v->cap ? v->cap * 2 : 8;
    while (newcap < need) newcap *= 2;
    v->a = (Snapshot*)xrealloc(v->a, newcap * sizeof(Snapshot));
    v->cap = newcap;
}
static void snapshot_free(Snapshot* s) {
    if (!s) return;
    free(s->content);
    free(s->ts);
}
static void snapvec_truncate(SnapVec* v, size_t newn) {
    if (newn >= v->n) return;
    for (size_t i = newn; i < v->n; ++i) snapshot_free(&v->a[i]);
    v->n = newn;
}
static void snapvec_push(SnapVec* v, Snapshot s) {
    snapvec_reserve(v, v->n + 1);
    v->a[v->n++] = s;
}

// ------------------------------- Editor State -------------------------------

typedef struct {
    char*   staged;        // working (uncommitted) text
    SnapVec history;       // snapshots
    size_t  current_idx;   // active snapshot index
} Editor;

static void editor_init(Editor* e) {
    e->staged = xstrdup("");
    snapvec_init(&e->history);

    Snapshot s0;
    s0.content = xstrdup("");
    s0.ts = timestamp_now();
    snprintf(s0.op, sizeof(s0.op), "init");
    s0.delta = 0;
    s0.len = 0;

    snapvec_push(&e->history, s0);
    e->current_idx = 0;
}

static void editor_free(Editor* e) {
    free(e->staged);
    for (size_t i = 0; i < e->history.n; ++i) snapshot_free(&e->history.a[i]);
    free(e->history.a);
}

static void editor_show(const Editor* e) {
    printf("----- Current Note (step #%zu, len %zu) -----\n",
           e->current_idx, strlen(e->staged));
    printf("%s\n", e->staged);
    printf("--------------------------------------------\n");
}

static void editor_set(Editor* e, const char* text) {
    free(e->staged);
    e->staged = xstrdup(text ? text : "");
}

static void editor_append(Editor* e, const char* text) {
    if (!text) return;
    size_t cur = strlen(e->staged);
    size_t add = strlen(text);
    size_t extra = (cur > 0) ? 1 : 0; // add '\n' between lines
    char* buf = (char*)xrealloc(e->staged, cur + extra + add + 1);
    e->staged = buf;
    if (extra) e->staged[cur++] = '\n';
    memcpy(e->staged + cur, text, add);
    e->staged[cur + add] = '\0';
}

static int compute_delta(const char* prev, const char* next) {
    int a = (int)strlen(prev ? prev : "");
    int b = (int)strlen(next ? next : "");
    return b - a;
}

static void editor_commit(Editor* e) {
    // If committing from mid-history, drop future steps (new branch).
    if (e->current_idx + 1 < e->history.n) {
        snapvec_truncate(&e->history, e->current_idx + 1);
    }
    const char* prev = e->history.a[e->current_idx].content;

    Snapshot s;
    s.content = xstrdup(e->staged);
    s.ts = timestamp_now();
    snprintf(s.op, sizeof(s.op), "commit");
    s.delta = compute_delta(prev, s.content);
    s.len = (int)strlen(s.content);

    snapvec_push(&e->history, s);
    e->current_idx = e->history.n - 1;
    printf("Committed step #%zu (Δ %d chars, len %d)\n",
           e->current_idx, s.delta, s.len);
}

static void editor_goto(Editor* e, size_t idx) {
    if (idx >= e->history.n) {
        printf("No such step #%zu\n", idx);
        return;
    }
    e->current_idx = idx;
    editor_set(e, e->history.a[e->current_idx].content);
    printf("Jumped to step #%zu\n", e->current_idx);
}

static void editor_undo(Editor* e) {
    if (e->current_idx == 0) {
        printf("Nothing to undo.\n");
        return;
    }
    e->current_idx--;
    editor_set(e, e->history.a[e->current_idx].content);
    printf("Undid to step #%zu\n", e->current_idx);
}

static void editor_redo(Editor* e) {
    if (e->current_idx + 1 >= e->history.n) {
        printf("Nothing to redo.\n");
        return;
    }
    e->current_idx++;
    editor_set(e, e->history.a[e->current_idx].content);
    printf("Redid to step #%zu\n", e->current_idx);
}

static void editor_peek(const Editor* e, size_t last_n) {
    size_t start = 0;
    if (last_n > 0 && last_n < e->history.n) start = e->history.n - last_n;
    printf("----- Logs (%zu steps total) -----\n", e->history.n);
    for (size_t i = start; i < e->history.n; ++i) {
        const Snapshot* s = &e->history.a[i];
        printf("#%zu%s | %s | op:%s | Δ %d | len %d\n",
               i, (i == e->current_idx ? " [current]" : ""),
               s->ts, s->op, s->delta, s->len);
        const char* c = s->content ? s->content : "";
        size_t L = strlen(c);
        size_t show = L > 120 ? 120 : L;
        printf("  \"%.*s\"%s\n", (int)show, c, (L > 120 ? "…" : ""));
    }
    printf("----------------------------------\n");
}

static void editor_export_json(const Editor* e, const char* path) {
    FILE* f = fopen(path, "wb");
    if (!f) { perror("fopen"); return; }
    fputs("[\n", f);
    for (size_t i = 0; i < e->history.n; ++i) {
        const Snapshot* s = &e->history.a[i];
        // escape content minimally for JSON
        const char* src = s->content ? s->content : "";
        size_t len = strlen(src);
        char* esc = (char*)malloc(len * 2 + 1);
        if (!esc) { fclose(f); die_oom(); }
        size_t j = 0;
        for (size_t k = 0; k < len; ++k) {
            unsigned char ch = (unsigned char)src[k];
            if (ch == '\\' || ch == '\"') { esc[j++] = '\\'; esc[j++] = ch; }
            else if (ch == '\n') { esc[j++] = '\\'; esc[j++] = 'n'; }
            else if (ch == '\r') { /* skip */ }
            else { esc[j++] = ch; }
        }
        esc[j] = '\0';

        fprintf(f,
            "  {\"step\":%zu,\"ts\":\"%s\",\"op\":\"%s\",\"delta\":%d,\"len\":%d,\"content\":\"%s\"}%s\n",
            i, s->ts, s->op, s->delta, s->len, esc, (i + 1 < e->history.n ? "," : "")
        );
        free(esc);
    }
    fputs("]\n", f);
    fclose(f);
    printf("Exported %zu steps to %s\n", e->history.n, path);
}

static void editor_reset(Editor* e) {
    free(e->staged);
    e->staged = xstrdup("");
    snapvec_truncate(&e->history, 0);

    Snapshot s0;
    s0.content = xstrdup("");
    s0.ts = timestamp_now();
    snprintf(s0.op, sizeof(s0.op), "init");
    s0.delta = 0;
    s0.len = 0;

    snapvec_push(&e->history, s0);
    e->current_idx = 0;
    printf("Reset done.\n");
}

// ------------------------------- REPL -------------------------------

static void help(void) {
    puts("Commands:");
    puts("  type <text>        Replace entire note with <text> (staged)");
    puts("  append <text>      Append newline + <text> (staged)");
    puts("  commit             Create a snapshot");
    puts("  show               Print current note");
    puts("  -peek              Show all logs");
    puts("  -since <n>         Show last n logs");
    puts("  -goto <k>          Jump to step k");
    puts("  -undo / -redo      Undo or redo one step");
    puts("  export <file.json> Export all logs to JSON");
    puts("  reset              Clear content and history");
    puts("  help               This help");
    puts("  quit               Exit");
}

int main(void) {
    Editor ed;
    editor_init(&ed);

    printf("Stack Note Editor (C99) — MinGW-friendly\n");
    printf("Type 'help' for commands. Example: type hello world -> commit -> -peek\n");

    char line[8192];
    for (;;) {
        printf("> ");
        if (!fgets(line, sizeof(line), stdin)) break;
        rstrip(line);
        if (!*line) continue;

        char* p = line;
        while (isspace((unsigned char)*p)) ++p;

        char cmd[64] = {0};
        size_t ci = 0;
        while (*p && !isspace((unsigned char)*p) && ci + 1 < sizeof(cmd)) {
            cmd[ci++] = *p++;
        }
        cmd[ci] = '\0';
        while (isspace((unsigned char)*p)) ++p;
        char* arg = p;

        if (strcmp(cmd, "quit") == 0 || strcmp(cmd, "exit") == 0) {
            break;
        } else if (strcmp(cmd, "help") == 0) {
            help();
        } else if (strcmp(cmd, "show") == 0) {
            editor_show(&ed);
        } else if (strcmp(cmd, "type") == 0) {
            editor_set(&ed, arg);
            printf("Staged new content (len %zu). Use 'commit' to save a step.\n", strlen(ed.staged));
        } else if (strcmp(cmd, "append") == 0) {
            editor_append(&ed, arg);
            printf("Staged append (len %zu). Use 'commit' to save a step.\n", strlen(ed.staged));
        } else if (strcmp(cmd, "commit") == 0) {
            editor_commit(&ed);
        } else if (strcmp(cmd, "-peek") == 0) {
            editor_peek(&ed, 0);
        } else if (strcmp(cmd, "-since") == 0) {
            long n = strtol(arg, NULL, 10);
            if (n <= 0) n = 5;
            editor_peek(&ed, (size_t)n);
        } else if (strcmp(cmd, "-goto") == 0) {
            char* endptr = NULL;
            long k = strtol(arg, &endptr, 10);
            if (endptr == arg || k < 0) {
                printf("Usage: -goto <nonnegative step index>\n");
            } else {
                editor_goto(&ed, (size_t)k);
            }
        } else if (strcmp(cmd, "-undo") == 0) {
            editor_undo(&ed);
        } else if (strcmp(cmd, "-redo") == 0) {
            editor_redo(&ed);
        } else if (strcmp(cmd, "export") == 0) {
            if (!*arg) {
                printf("Usage: export <file.json>\n");
            } else {
                editor_export_json(&ed, arg);
            }
        } else if (strcmp(cmd, "reset") == 0) {
            editor_reset(&ed);
        } else {
            printf("Unknown command '%s'. Type 'help'.\n", cmd);
        }
    }

    editor_free(&ed);
    return 0;
}
