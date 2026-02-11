import javax.swing.*;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

public class NotesEditor {

    enum OpType { SET, COMMIT, AMEND }
    static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    static class Action {
        final int id; final String timestamp; final OpType type;
        final String before; final String after; final Integer amends;
        Action(int id, OpType type, String before, String after, Integer amends){
            this.id=id; this.type=type; this.before=before; this.after=after; this.amends=amends;
            this.timestamp = LocalDateTime.now().format(TS);
        }
        int delta(){ return after.length() - (before==null?0:before.length()); }
        String preview(){ String s = after.replace("\n"," "); return s.length()>120? s.substring(0,120)+"…" : s; }
        public String toString(){
            String base = String.format("#%d | %s | %s | Δ %s | len %d",
                    id, timestamp, type, (delta()>=0? "+"+delta(): String.valueOf(delta())), after.length());
            if(type==OpType.AMEND && amends!=null) base += " | amends #"+amends;
            return base + "  —  \""+preview()+"\"";
        }
    }

    static class Stack<T>{
        private final Deque<T> dq = new ArrayDeque<>();
        void push(T x){ dq.push(x); }
        T pop(){ return dq.isEmpty()? null : dq.pop(); }
        T peek(){ return dq.peek(); }
        boolean isEmpty(){ return dq.isEmpty(); }
        void clear(){ dq.clear(); }
        int size(){ return dq.size(); }
    }

    private final java.util.List<Action> logs = new ArrayList<>();
    private final Stack<Action> undo = new Stack<>();
    private final Stack<Action> redo = new Stack<>();
    private int nextId = 0;

    private JFrame frame;
    private JTextArea editor;
    private JLabel status;

    public static void main(String[] args){
        System.setProperty("java.awt.headless","false");
        SwingUtilities.invokeLater(() -> new NotesEditor().start());
    }

    private void start(){
        frame = new JFrame("Notes Editor — Stack Undo/Redo + Peek + Amend");
        frame.setDefaultCloseOperation(WindowConstants.EXIT_ON_CLOSE);
        frame.setSize(720, 520);
        frame.setLocationByPlatform(true);
        frame.setLayout(new BorderLayout());

        var top = new JLabel("Notes (type → Commit to log; Set replaces content directly)");
        top.setBorder(new EmptyBorder(8,8,0,8));
        frame.add(top, BorderLayout.NORTH);

        editor = new JTextArea(14, 60);
        editor.setFont(new Font(Font.MONOSPACED, Font.PLAIN, 14));
        editor.setLineWrap(true);
        editor.setWrapStyleWord(true);
        var sp = new JScrollPane(editor);
        sp.setBorder(new EmptyBorder(8,8,8,8));
        frame.add(sp, BorderLayout.CENTER);

        var bar = new JPanel(new FlowLayout(FlowLayout.LEFT,8,6));
        JButton bSet=new JButton("Set"), bCommit=new JButton("Commit"),
                bUndo=new JButton("Undo"), bRedo=new JButton("Redo"),
                bPeek=new JButton("Logs"), bReset=new JButton("Reset");
        bar.add(bSet); bar.add(bCommit);
        bar.add(new JSeparator(SwingConstants.VERTICAL));
        bar.add(bUndo); bar.add(bRedo);
        bar.add(new JSeparator(SwingConstants.VERTICAL));
        bar.add(bPeek);
        bar.add(new JSeparator(SwingConstants.VERTICAL));
        bar.add(bReset);

        status = new JLabel("Ready.");
        var south = new JPanel(new BorderLayout());
        south.add(bar, BorderLayout.NORTH);
        south.add(status, BorderLayout.SOUTH);
        south.setBorder(new EmptyBorder(0,8,8,8));
        frame.add(south, BorderLayout.SOUTH);

        // Wire
        bSet.addActionListener(e -> onSet());
        bCommit.addActionListener(e -> onCommit());
        bUndo.addActionListener(e -> onUndo());
        bRedo.addActionListener(e -> onRedo());
        bPeek.addActionListener(e -> onPeek());
        bReset.addActionListener(e -> onReset());

        // Shortcuts
        var mask = Toolkit.getDefaultToolkit().getMenuShortcutKeyMaskEx();
        editor.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke(KeyEvent.VK_S, mask), "commit");
        editor.getActionMap().put("commit", new AbstractAction(){ public void actionPerformed(ActionEvent e){ onCommit(); }});
        editor.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke(KeyEvent.VK_Z, mask), "undo");
        editor.getActionMap().put("undo", new AbstractAction(){ public void actionPerformed(ActionEvent e){ onUndo(); }});
        editor.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke(KeyEvent.VK_Y, mask), "redo");
        editor.getActionMap().put("redo", new AbstractAction(){ public void actionPerformed(ActionEvent e){ onRedo(); }});
        editor.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke(KeyEvent.VK_Z, mask|KeyEvent.SHIFT_DOWN_MASK), "redoShiftZ");
        editor.getActionMap().put("redoShiftZ", new AbstractAction(){ public void actionPerformed(ActionEvent e){ onRedo(); }});
        editor.getInputMap(JComponent.WHEN_IN_FOCUSED_WINDOW).put(KeyStroke.getKeyStroke(KeyEvent.VK_L, mask), "peek");
        editor.getActionMap().put("peek", new AbstractAction(){ public void actionPerformed(ActionEvent e){ onPeek(); }});

        frame.setVisible(true);
        frame.toFront();
    }

    // Actions
    private void onSet(){
        String before = editor.getText(); // treat current as before
        String after = editor.getText();  // same content (explicit Set logs a step)
        Action a = new Action(nextId++, OpType.SET, before, after, null);
        logs.add(a); undo.push(a); redo.clear();
        setStatus("SET -> step #"+a.id+" (len "+after.length()+", Δ "+d(a)+")");
    }
    private void onCommit(){
        String before = logs.isEmpty()? "" : logs.get(logs.size()-1).after;
        String after = editor.getText();
        if(Objects.equals(before, after)){ setStatus("Nothing changed; commit skipped."); return; }
        Action a = new Action(nextId++, OpType.COMMIT, before, after, null);
        logs.add(a); undo.push(a); redo.clear();
        setStatus("COMMIT -> step #"+a.id+" (len "+after.length()+", Δ "+d(a)+")");
    }
    private void onUndo(){
        Action a = undo.pop(); if(a==null){ setStatus("Nothing to undo."); return; }
        editor.setText(a.before); redo.push(a);
        setStatus("Undo -> #"+a.id+" (len "+a.before.length()+")");
    }
    private void onRedo(){
        Action a = redo.pop(); if(a==null){ setStatus("Nothing to redo."); return; }
        editor.setText(a.after); undo.push(a);
        setStatus("Redo -> #"+a.id+" (len "+a.after.length()+")");
    }
    private void onReset(){
        int c = JOptionPane.showConfirmDialog(frame, "Clear editor and history?", "Reset", JOptionPane.OK_CANCEL_OPTION);
        if(c!=JOptionPane.OK_OPTION) return;
        logs.clear(); undo.clear(); redo.clear(); editor.setText(""); nextId=0;
        setStatus("Reset.");
    }

    // Logs dialog: peek, jump, amend
    private void onPeek(){
        JDialog d = new JDialog(frame, "Logs (peek) — "+logs.size()+" steps", true);
        d.setSize(640, 420); d.setLocationRelativeTo(frame); d.setLayout(new BorderLayout());

        DefaultListModel<Action> m = new DefaultListModel<>();
        for(Action a: logs) m.addElement(a);
        JList<Action> list = new JList<>(m);
        list.setCellRenderer(new DefaultListCellRenderer(){
            public Component getListCellRendererComponent(JList<?> l, Object v, int i, boolean s, boolean f){
                super.getListCellRendererComponent(l,v,i,s,f);
                if(v instanceof Action) setText(((Action)v).toString());
                setBorder(new EmptyBorder(6,8,6,8));
                return this;
            }
        });
        var sp = new JScrollPane(list); sp.setBorder(new EmptyBorder(8,8,0,8));
        d.add(sp, BorderLayout.CENTER);

        var btns = new JPanel(new FlowLayout(FlowLayout.RIGHT,8,8));
        JButton bPeekTop=new JButton("peek()");
        JButton bJump=new JButton("Jump");
        JButton bAmend=new JButton("Amend…");
        JButton bClose=new JButton("Close");
        btns.add(bPeekTop); btns.add(bJump); btns.add(bAmend); btns.add(bClose);
        d.add(btns, BorderLayout.SOUTH);

        bPeekTop.addActionListener(e -> {
            String u = (undo.peek()==null? "(none)" : "#"+undo.peek().id+" "+undo.peek().type+" (Δ "+d(undo.peek())+")");
            String r = (redo.peek()==null? "(none)" : "#"+redo.peek().id+" "+redo.peek().type+" (Δ "+d(redo.peek())+")");
            JOptionPane.showMessageDialog(d, "Next UNDO: "+u+"\nNext REDO: "+r, "peek()", JOptionPane.INFORMATION_MESSAGE);
        });
        bJump.addActionListener(e -> {
            Action sel = list.getSelectedValue();
            if(sel==null){ JOptionPane.showMessageDialog(d, "Select a log first."); return; }
            editor.setText(sel.after);
            setStatus("Jumped to snapshot of #"+sel.id+" (len "+sel.after.length()+"). Commit to record.");
        });
        bAmend.addActionListener(e -> {
            Action sel = list.getSelectedValue();
            if(sel==null){ JOptionPane.showMessageDialog(d, "Select a log to amend."); return; }
            String newText = promptLarge(d, "Amend log #"+sel.id, sel.after);
            if(newText==null) return;
            String before = editor.getText();
            editor.setText(newText);
            Action amend = new Action(nextId++, OpType.AMEND, before, newText, sel.id);
            logs.add(amend); undo.push(amend); redo.clear();
            m.addElement(amend);
            setStatus("AMEND -> #"+amend.id+" (amends #"+sel.id+"), len "+newText.length()+", Δ "+d(amend));
        });
        bClose.addActionListener(e -> d.dispose());

        d.setVisible(true);
    }

    // Utils
    private void setStatus(String s){ status.setText(s); }
    private static String d(Action a){ int x=a.delta(); return x>=0? "+"+x : String.valueOf(x); }

    private static String promptLarge(Component parent, String title, String initial){
        JTextArea ta = new JTextArea(10,50);
        ta.setText(initial==null? "" : initial);
        ta.setLineWrap(true); ta.setWrapStyleWord(true);
        JScrollPane sc = new JScrollPane(ta);
        int res = JOptionPane.showConfirmDialog(parent, sc, title, JOptionPane.OK_CANCEL_OPTION, JOptionPane.PLAIN_MESSAGE);
        return res==JOptionPane.OK_OPTION? ta.getText() : null;
    }
}