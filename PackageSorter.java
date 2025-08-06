public class PackageSorter {
    public static int minOperations(int[] packageSequence) {
        int n = packageSequence.length;
        int sortedCount = 0;
        int operations = 0;

        while (sortedCount < n) {
            boolean progressed = false;
            for (int i = 0; i < n; i++) {
                if (packageSequence[i] == sortedCount + 1) {
                    sortedCount++;
                    progressed = true;
                }
            }
            operations++;
        }
        return operations;
    }

    // Example usage
    public static void main(String[] args) {
        int[] seq1 = {5, 3, 4, 1, 2};
        int[] seq2 = {3, 1, 4, 2, 5};
        System.out.println(minOperations(seq1)); // Output: 2
        System.out.println(minOperations(seq2)); // Output: 3
    }
}
