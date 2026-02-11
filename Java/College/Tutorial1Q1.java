import java.util.Scanner;

public class Tutorial1Q1 {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        // Ask the user to enter their age
        System.out.print("Enter your age: ");
        int age = sc.nextInt();

        // Check if the user is eligible to vote
        if (age >= 18) {
            System.out.println("Eligible to vote");
        } else {
            System.out.println("Not eligible to vote");
        }

        sc.close();
    }
}