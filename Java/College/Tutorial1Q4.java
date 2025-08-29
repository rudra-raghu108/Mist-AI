import java.util.Scanner;

public class Tutorial1Q4 {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Enter a sentence: ");
        String sentence = scanner.nextLine();

        // Split the sentence into words using space as delimiter
        String[] words = sentence.split(" ");

        // Print each word on a new line
        for (String word : words) {
            System.out.println(word);
        }

        scanner.close();
    }
}
