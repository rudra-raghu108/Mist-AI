import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.ArrayList;

public class VirtualAssistantUI{
    private JFrame frame;
    private JTextArea textArea;
    private JTextField inputField;
    private JScrollPane scrollPane;
    private int currentMenu;
    private JPanel historyPanel;
    private DefaultListModel<String> chatHistoryModel;
    private JList<String> chatHistoryList;
    private boolean loggedIn = false;
    private ArrayList<String> chatHistory = new ArrayList<>();

    public VirtualAssistantUI() {
        frame = new JFrame("SRM Virtual Assistant");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(600, 400);

        textArea = new JTextArea(10, 40);
        textArea.setEditable(false);
        textArea.setLineWrap(true);
        textArea.setWrapStyleWord(true);
        scrollPane = new JScrollPane(textArea);

        inputField = new JTextField(40);
        JButton sendButton = new JButton("Send");
        sendButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String input = inputField.getText();
                if (loggedIn) {
                    processUserInput(input);
                } else {
                    appendText("You are not logged in. Please log in first.");
                }
                inputField.setText(""); // Clear the input field after sending
            }
        });

        // Chat History Panel
        chatHistoryModel = new DefaultListModel<>();
        chatHistoryList = new JList<>(chatHistoryModel);
        JScrollPane chatHistoryScrollPane = new JScrollPane(chatHistoryList);
        chatHistoryScrollPane.setPreferredSize(new Dimension(580, 100)); // Set preferred size for history panel

        historyPanel = new JPanel(new BorderLayout());
        historyPanel.add(chatHistoryScrollPane, BorderLayout.CENTER);


        JPanel inputPanel = new JPanel();
        inputPanel.add(inputField);
        inputPanel.add(sendButton);

        frame.add(scrollPane, BorderLayout.CENTER);
        frame.add(inputPanel, BorderLayout.SOUTH);
        frame.add(historyPanel, BorderLayout.EAST); // Placing history panel to the East

        redirectSystemStreams();
        frame.setVisible(true);

        showLoginFrame();
    }

    private void showLoginFrame() {
        JFrame loginFrame = new JFrame("Login");
        loginFrame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        loginFrame.setSize(300, 150);
        loginFrame.setLocationRelativeTo(frame); // Center login frame relative to main frame

        JPanel loginPanel = new JPanel(new GridLayout(3, 2));
        JLabel usernameLabel = new JLabel("Username:");
        JTextField usernameField = new JTextField();
        JLabel passwordLabel = new JLabel("Password:");
        JPasswordField passwordField = new JPasswordField();
        JButton loginButton = new JButton("Login");

        loginButton.addActionListener(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                String username = usernameField.getText();
                String password = new String(passwordField.getPassword());
                boolean authenticated = authenticate(username, password);
                if (authenticated) {
                    loggedIn = true;
                    loginFrame.dispose();
                    mainMenu();
                } else {
                    JOptionPane.showMessageDialog(loginFrame, "Invalid credentials. Please try again.");
                }
            }
        });

        loginPanel.add(usernameLabel);
        loginPanel.add(usernameField);
        loginPanel.add(passwordLabel);
        loginPanel.add(passwordField);
        loginPanel.add(loginButton);

        loginFrame.add(loginPanel, BorderLayout.CENTER);
        loginFrame.setVisible(true);
    }

    public void appendText(String text) {
        textArea.append(text + "\n");
        textArea.setCaretPosition(textArea.getDocument().getLength()); // Auto-scroll to the bottom
    }

    public void appendChatHistory(String text) {
        chatHistoryModel.addElement(text);
        chatHistoryList.ensureIndexIsVisible(chatHistoryModel.size() - 1);
    }

    public void processUserInput(String input) {
        appendText("User: " + input);
        appendChatHistory("User: " + input);

        try {
            int choice = Integer.parseInt(input.trim()); // Trim to handle potential whitespace
            switch (currentMenu) {
                case 0:
                    handleMainMenuChoice(choice);
                    break;
                case 1:
                    handleHostelChoice(choice);
                    break;
                case 2:
                    handleFeesChoice(choice);
                    break;
                case 3:
                    handleMessChoice(choice);
                    break;
                case 4:
                    handlePlacementsChoice(choice);
                    break;
                case 5:
                    handleCampusLifeChoice(choice);
                    break;
            }
        } catch (NumberFormatException e) {
            appendText("Invalid input. Please enter a number corresponding to the menu option.");
        }
    }

    private void handleMainMenuChoice(int choice) {
        switch (choice) {
            case 1:
                hostel();
                break;
            case 2:
                fees();
                break;
            case 3:
                mess();
                break;
            case 4:
                placements();
                break;
            case 5:
                campusLife();
                break;
            case 0:
                appendText("~ Goodbye! ~");
                appendChatHistory("~ Goodbye! ~");
                System.exit(0);
                break;
            default:
                appendText("Invalid choice. Please select a valid option.");
        }
    }

    private void handleHostelChoice(int choice) {
        switch (choice) {
            case 1:
                hostelFacilities();
                break;
            case 2:
                hostelRulesAndRegulations();
                break;
            case 3:
                hostelSecurityMeasures();
                break;
            case 4:
                hostelFeesStructure();
                break;
            case 5:
                hostelAmenities();
                break;
            case 0:
                currentMenu = 0;
                mainMenu();
                break;
            default:
                appendText("Invalid choice. Please select a valid option.");
        }
    }

    private void handleFeesChoice(int choice) {
        switch (choice) {
            case 1:
                tuitionFees();
                break;
            case 2:
                modeOfPayment();
                break;
            case 3:
                scholarships();
                break;
            case 4:
                refundPolicies();
                break;
            case 0:
                currentMenu = 0;
                mainMenu();
                break;
            default:
                appendText("Invalid choice. Please select a valid option.");
        }
    }

    private void handleMessChoice(int choice) {
        switch (choice) {
            case 1:
                messMenu();
                break;
            case 2:
                mealTimings();
                break;
            case 3:
                servingStyle();
                break;
            case 4:
                qualityAndHygiene();
                break;
            case 0:
                currentMenu = 0;
                mainMenu();
                break;
            default:
                appendText("Invalid choice. Please select a valid option.");
        }
    }

    private void handlePlacementsChoice(int choice) {
        switch (choice) {
            case 1:
                placementStatistics();
                break;
            case 2:
                placementProcess();
                break;
            case 3:
                topRecruiters();
                break;
            case 0:
                currentMenu = 0;
                mainMenu();
                break;
            default:
                appendText("Invalid choice. Please select a valid option.");
        }
    }

    private void handleCampusLifeChoice(int choice) {
        switch (choice) {
            case 1:
                studentClubsAndActivities();
                break;
            case 2:
                culturalEvents();
                break;
            case 0:
                currentMenu = 0;
                mainMenu();
                break;
            default:
                appendText("Invalid choice. Please select a valid option.");
        }
    }

    public void hostel() {
        currentMenu = 1;
        appendText("--- Hostel Information ---");
        appendText("SRM Kattankulathur offers modern hostel facilities with spacious rooms, Wi-Fi connectivity, and 24/7 security.");
        appendText("Additionally, students have access to a three-star hotel inside the campus for Hotel Management students.");
        appendText("There's also SRM Hospital, which provides free medical treatment to students from hostels.");
        appendText("\nSelect an option:");
        appendText("1. Hostel Facilities");
        appendText("2. Hostel Rules and Regulations");
        appendText("3. Hostel Security Measures");
        appendText("4. Hostel Fees Structures");
        appendText("5. Hostel Amenities");
        appendText("0. Return Back to Main Menu");
    }

    public void fees() {
        currentMenu = 2;
        appendText("--- Fees Information ---");
        appendText("Tuition fees at SRM Kattankulathur may vary based on the chosen course.");
        appendText("For the latest fee structure, please refer to the university's website.");
        appendText("The university offers scholarships and financial aid to eligible students.");
        appendText("\nSelect an option:");
        appendText("1. Tuition Fees");
        appendText("2. Mode of Payment");
        appendText("3. Scholarships");
        appendText("4. Refund Policies");
        appendText("0. Return Back to Main Menu");
    }

    public void mess() {
        currentMenu = 3;
        appendText("--- Mess Information ---");
        appendText("SRM Kattankulathur's mess serves a variety of delicious and nutritious meals daily, including vegetarian and non-vegetarian options.");
        appendText("Students can enjoy diverse culinary experiences within the campus.");
        appendText("\nSelect an option:");
        appendText("1. Mess Menu");
        appendText("2. Meal Timings");
        appendText("3. Serving Style");
        appendText("4. Quality and Hygiene");
        appendText("0. Return Back to Main Menu");
    }

    public void placements() {
        currentMenu = 4;
        appendText("--- Placements Information ---");
        appendText("SRM Kattankulathur offers excellent placement opportunities for students.");
        appendText("The university has a dedicated placement cell that conducts various activities to prepare students for placements.");
        appendText("\nSelect an option:");
        appendText("1. Placement Statistics");
        appendText("2. Placement Process");
        appendText("3. Top Recruiters");
        appendText("0. Return Back to Main Menu");
    }

    public void campusLife() {
        currentMenu = 5;
        appendText("--- Campus Life Information ---");
        appendText("SRM Kattankulathur offers a vibrant campus life with numerous clubs, events, and activities.");
        appendText("Students can engage in a variety of extracurricular and cultural activities.");
        appendText("\nSelect an option:");
        appendText("1. Student Clubs and Activities");
        appendText("2. Cultural Events");
        appendText("0. Return Back to Main Menu");
    }

    public void hostelFacilities() {
        appendText("--- Hostel Facilities ---");
        appendText("1. Single and double sharing rooms");
        appendText("2. Wi-Fi connectivity");
        appendText("3. 24/7 security");
        appendText("4. In-house laundry");
        appendText("5. Common rooms for recreation");
        appendText("0. Return Back to Hostel Menu");
    }

    public void hostelRulesAndRegulations() {
        appendText("--- Hostel Rules and Regulations ---");
        appendText("1. Proper ID card required for entry");
        appendText("2. Visitors allowed only in common areas");
        appendText("3. Smoking and alcohol are strictly prohibited");
        appendText("4. Curfew timings must be followed");
        appendText("0. Return Back to Hostel Menu");
    }

    public void hostelSecurityMeasures() {
        appendText("--- Hostel Security Measures ---");
        appendText("1. 24/7 security personnel");
        appendText("2. CCTV surveillance");
        appendText("3. Biometric entry system");
        appendText("4. Emergency response teams");
        appendText("0. Return Back to Hostel Menu");
    }

    public void hostelFeesStructure() {
        appendText("--- Hostel Fees Structure ---");
        appendText("For the latest hostel fees structure, please refer to the university's website.");
        appendText("0. Return Back to Hostel Menu");
    }

    public void hostelAmenities() {
        appendText("--- Hostel Amenities ---");
        appendText("1. Gymnasium");
        appendText("2. Cafeteria");
        appendText("3. Recreation areas");
        appendText("4. Medical facilities");
        appendText("0. Return Back to Hostel Menu");
    }

    public void tuitionFees() {
        appendText("--- Tuition Fees ---");
        appendText("Tuition fees may vary based on the chosen course. For detailed fee information, please check the university's website.");
        appendText("0. Return Back to Fees Menu");
    }

    public void modeOfPayment() {
        appendText("--- Mode of Payment ---");
        appendText("The university accepts payment through online and offline modes. Details can be found on the official website.");
        appendText("0. Return Back to Fees Menu");
    }

    public void scholarships() {
        appendText("--- Scholarships ---");
        appendText("SRM Kattankulathur offers various scholarships to eligible students based on merit and need.");
        appendText("For scholarship details, please refer to the official website.");
        appendText("0. Return Back to Fees Menu");
    }

    public void refundPolicies() {
        appendText("--- Refund Policies ---");
        appendText("For information on refund policies, please check the university's official website.");
        appendText("0. Return Back to Fees Menu");
    }

    public void messMenu() {
        appendText("--- Mess Menu ---");
        appendText("The mess serves a variety of delicious and nutritious meals daily, including vegetarian and non-vegetarian options.");
        appendText("The menu changes regularly to provide diverse culinary experiences.");
        appendText("0. Return Back to Mess Menu");
    }

    public void mealTimings() {
        appendText("--- Meal Timings ---");
        appendText("Breakfast: 7:30 AM - 9:30 AM");
        appendText("Lunch: 12:00 PM - 2:00 PM");
        appendText("Dinner: 7:30 PM - 9:30 PM");
        appendText("0. Return Back to Mess Menu");
    }

    public void servingStyle() {
        appendText("--- Serving Style ---");
        appendText("Self-service style with a variety of food counters");
        appendText("0. Return Back to Mess Menu");
    }

    public void qualityAndHygiene() {
        appendText("--- Quality and Hygiene ---");
        appendText("Strict quality and hygiene standards are maintained in food preparation.");
        appendText("Regular checks are conducted to ensure food safety.");
        appendText("0. Return Back to Mess Menu");
    }

    public void placementStatistics() {
        appendText("--- Placement Statistics ---");
        appendText("The university has an excellent track record of placements, with high placement percentages.");
        appendText("For detailed statistics, please refer to the official website.");
        appendText("0. Return Back to Placements Menu");
    }

    public void placementProcess() {
        appendText("--- Placement Process ---");
        appendText("The university's placement cell conducts various activities to prepare students for placements.");
        appendText("This includes training, mock interviews, and resume building.");
        appendText("0. Return Back to Placements Menu");
    }

    public void topRecruiters() {
        appendText("--- Top Recruiters ---");
        appendText("SRM Kattankulathur has a long list of top recruiters in various sectors.");
        appendText("For the list of top recruiters, please refer to the official website.");
        appendText("0. Return Back to Placements Menu");
    }

    public void studentClubsAndActivities() {
        appendText("--- Student Clubs and Activities ---");
        appendText("There are various student clubs and activities, including technical, cultural, and sports clubs.");
        appendText("Students can actively participate in these clubs.");
        appendText("0. Return Back to Campus Life Menu");
    }

    public void culturalEvents() {
        appendText("--- Cultural Events ---");
        appendText("The campus hosts a variety of cultural events throughout the year, including festivals, dance, music, and more.");
        appendText("Students can showcase their talents in these events.");
        appendText("0. Return Back to Campus Life Menu");
    }

    public void mainMenu() {
        currentMenu = 0;
        appendText("\n--- Welcome to SRM Kattankulathur Virtual Assistant! ---");
        appendText("Choose an option to find out more:");
        appendText("1. Hostel");
        appendText("2. Fees");
        appendText("3. Mess");
        appendText("4. Placements");
        appendText("5. Campus Life");
        appendText("0. Exit");
    }

    public void redirectSystemStreams() {
        OutputStream out = new OutputStream() {
            @Override
            public void write(int b) {
                appendText(String.valueOf((char) b));
            }

            @Override
            public void write(byte[] b, int off, int len) {
                appendText(new String(b, off, len));
            }
        };
        System.setOut(new PrintStream(out, true));
        System.setErr(new PrintStream(out, true));
    }

    private boolean authenticate(String username, String password) {
        // For demonstration purposes, this allows access with any credentials.
        // In a real application, you would replace this with actual authentication logic.
        // Example: return (username.equals("yourUsername") && password.equals("yourPassword"));
        return true;
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(new Runnable() {
            public void run() {
                new VirtualAssistantUI();
            }
        });
    }
}