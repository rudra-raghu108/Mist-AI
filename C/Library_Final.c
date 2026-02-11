#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define MAX_BOOKS 1000
#define TITLE_LEN 100
#define AUTHOR_LEN 100
#define DATAFILE "library.dat"

typedef struct {
    int id;
    char title[TITLE_LEN];
    char author[AUTHOR_LEN];
    int total;
    int available;
} Book;

Book books[MAX_BOOKS];
int book_count = 0;

int find_index_by_id(int id) {
    int i;
    for (i = 0; i < book_count; i++) {
        if (books[i].id == id)
            return i;
    }
    return -1;
}

int next_id() {
    int max = 0, i;
    for (i = 0; i < book_count; i++) {
        if (books[i].id > max)
            max = books[i].id;
    }
    return max + 1;
}

void load_data() {
    FILE *f = fopen(DATAFILE, "rb");
    if (!f) return;
    fread(&book_count, sizeof(int), 1, f);
    if (book_count > 0 && book_count <= MAX_BOOKS)
        fread(books, sizeof(Book), book_count, f);
    fclose(f);
}

void save_data() {
    FILE *f = fopen(DATAFILE, "wb");
    if (!f) return;
    fwrite(&book_count, sizeof(int), 1, f);
    fwrite(books, sizeof(Book), book_count, f);
    fclose(f);
}

void add_book() {
    if (book_count >= MAX_BOOKS) {
        printf("Library full.\n");
        return;
    }

    Book b;
    char buf[32];
    b.id = next_id();

    printf("Enter title: ");
    fgets(b.title, TITLE_LEN, stdin);

    printf("Enter author: ");
    fgets(b.author, AUTHOR_LEN, stdin);

    printf("Enter number of copies: ");
    fgets(buf, sizeof(buf), stdin);
    b.total = atoi(buf);
    if (b.total < 1) b.total = 1;
    b.available = b.total;

    books[book_count++] = b;
    save_data();

    printf("Book added. ID = %d\n", b.id);
}

void list_books() {
    int i;
    if (book_count == 0) {
        printf("No books available.\n");
        return;
    }

    printf("ID\tAvail/Total\tTitle - Author\n");
    printf("-----------------------------------------------\n");

    for (i = 0; i < book_count; i++) {
        printf("%d\t%d/%d\t\t%s - %s\n",
               books[i].id,
               books[i].available,
               books[i].total,
               books[i].title,
               books[i].author);
    }
}

void search_books() {
    char choice[8];
    printf("Search by (1) ID or (2) Title/Author substring: ");
    fgets(choice, sizeof(choice), stdin);

    if (choice[0] == '1') {
        char buf[32];
        int id, idx;
        printf("Enter ID: ");
        fgets(buf, sizeof(buf), stdin);
        id = atoi(buf);

        idx = find_index_by_id(id);
        if (idx == -1) {
            printf("No book with ID %d\n", id);
            return;
        }

        printf("ID: %d\nTitle: %sAuthor: %sTotal: %d\nAvailable: %d\n",
               books[idx].id,
               books[idx].title,
               books[idx].author,
               books[idx].total,
               books[idx].available);

    } else {
        char q[TITLE_LEN];
        int i, found = 0;
        printf("Enter search text: ");
        fgets(q, sizeof(q), stdin);

        for (i = 0; i < book_count; i++) {
            if (strstr(books[i].title, q) != NULL ||
                strstr(books[i].author, q) != NULL) {

                if (!found) printf("Matches:\n");

                printf("%d\t%d/%d\t%s - %s\n",
                       books[i].id,
                       books[i].available,
                       books[i].total,
                       books[i].title,
                       books[i].author);
                found = 1;
            }
        }

        if (!found) printf("No matches.\n");
    }
}

void issue_book() {
    char buf[32];
    int id, idx;

    printf("Enter ID to issue: ");
    fgets(buf, sizeof(buf), stdin);
    id = atoi(buf);

    idx = find_index_by_id(id);
    if (idx == -1) {
        printf("Invalid ID.\n");
        return;
    }

    if (books[idx].available == 0) {
        printf("No copies available.\n");
        return;
    }

    books[idx].available--;
    save_data();
    printf("Book issued.\n");
}

void return_book() {
    char buf[32];
    int id, idx;

    printf("Enter ID to return: ");
    fgets(buf, sizeof(buf), stdin);
    id = atoi(buf);

    idx = find_index_by_id(id);
    if (idx == -1) {
        printf("Invalid ID.\n");
        return;
    }

    if (books[idx].available == books[idx].total) {
        printf("All copies already in library.\n");
        return;
    }

    books[idx].available++;
    save_data();
    printf("Book returned.\n");
}

void remove_book() {
    char buf[32];
    int id, idx, i;

    printf("Enter ID to remove: ");
    fgets(buf, sizeof(buf), stdin);
    id = atoi(buf);

    idx = find_index_by_id(id);
    if (idx == -1) {
        printf("Invalid ID.\n");
        return;
    }

    for (i = idx; i < book_count - 1; i++)
        books[i] = books[i + 1];

    book_count--;
    save_data();
    printf("Book removed.\n");
}

void menu() {
    char c[8];

    while (1) {
        printf("\n--- Library Menu ---\n");
        printf("1. Add Book\n");
        printf("2. List Books\n");
        printf("3. Search\n");
        printf("4. Issue Book\n");
        printf("5. Return Book\n");
        printf("6. Remove Book\n");
        printf("0. Exit\n");
        printf("Choice: ");
        fgets(c, sizeof(c), stdin);

        switch (c[0]) {
            case '1': add_book(); break;
            case '2': list_books(); break;
            case '3': search_books(); break;
            case '4': issue_book(); break;
            case '5': return_book(); break;
            case '6': remove_book(); break;
            case '0': save_data(); return;
            default: printf("Invalid choice.\n");
        }
    }
}

int main() {
    load_data();
    printf("PROJECT_NAME - Library Book Tracking System\n");
    printf("TEAM - Vedansh Jain, Adarsh Chaudhary\n");
    printf("SAP ID - 590023901, 590025023\n");
    printf("DATE - 08 Dec 2025\n");
    printf("Subject : Programming in C\n\n");
    menu();
    return 0;
}