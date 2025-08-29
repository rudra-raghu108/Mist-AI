public class Tutorial1Q5 {
    public static void main(String[] args) {
        int x = 5;

        System.out.println("Original value of x: " + x);

        // Post-increment: value is used first, then incremented
        System.out.println("Post-increment (x++): " + (x++)); // prints 5, then x becomes 6

        // Value of x after post-increment
        System.out.println("Value of x after post-increment: " + x); // prints 6

        // Pre-increment: value is incremented first, then used
        System.out.println("Pre-increment (++x): " + (++x)); // x becomes 7, then prints 7

        // Final value of x
        System.out.println("Final value of x: " + x); // prints 7
    }
}