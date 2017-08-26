import java.io.FileOutputStream;
import java.io.PrintStream;

public class JsonWriter {
    public void writeJsonFile(String input) {
        try {
            FileOutputStream fs = new FileOutputStream("data.js");
            PrintStream out = new PrintStream(fs);
            out.print(input);
            out.close();
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}
