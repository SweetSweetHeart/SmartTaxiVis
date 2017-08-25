import java.io.FileOutputStream;
import java.io.PrintStream;

public class JsonWriter {
    public void writeJsonFile(String input) {
        try {
            FileOutputStream m_fs = new FileOutputStream("data.js");
            PrintStream m_out = new PrintStream(m_fs);
            m_out.print(input);
            m_out.close();
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}
