/**
 * Created by Henry on 20/08/2017.
 */

import com.google.gson.Gson;

import java.io.FileOutputStream;
import java.io.PrintStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;

public class JsonExporter {
    private final String URL = "jdbc:mysql://45.76.131.144:3306/TaxiData";
    private final String USERNAME = "taxi";
    private final String PASSWORD = "taxidb";

    private final int TOTALZONE = 263;
    //private final int HOUR1 = 0;
    private final int HOUR2 = 24;
    private final int TIMEOUT = 10000;
    Connection con;
    Statement stmt;
    ResultSet rs;
    ArrayList<ArrayList<TaxiZone>> resultList = new ArrayList<>();
    private String PROCEDURE;

    public static void main(String[] args) {
        long startTime = System.currentTimeMillis();
        JsonExporter main = new JsonExporter();
        main.openConnection();
        main.setStatement();
        main.getHourlyData();
        main.writeJsonFile();
        main.closeConnection();
        long estimatedTime = System.currentTimeMillis() - startTime;
        System.out.println("Time taken: " + estimatedTime  + "ms");
    }


    public boolean openConnection() {
        try {
            Class.forName("com.mysql.jdbc.Driver");
            con = DriverManager.getConnection(
                    URL, USERNAME, PASSWORD);
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public boolean closeConnection() {
        try {
            con.close();
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public boolean setStatement() {
        try {
            stmt = con.createStatement();
            stmt.setQueryTimeout(TIMEOUT);
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public Statement getStatement() {
        return stmt;
    }

    public boolean setResultSet() {
        try {
            rs = getStatement().executeQuery("call getTotalCounts(" + PROCEDURE + ")");
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public ResultSet getResultSet() {
        return rs;
    }


    public void getHourlyData() {

        for (int i = 0; i < HOUR2; i++) {
            PROCEDURE = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet();
            convertToJSON();
        }

    }

    public void convertToJSON() {
        ArrayList<TaxiZone> zoneList = new ArrayList<>();

        try {
            while (getResultSet().next()) {
                TaxiZone t = new TaxiZone();
                t.setZoneId(rs.getInt(1));
                t.setZoneName(rs.getString(2));
                t.setPickUpCount(rs.getInt(3));
                t.setDropOffCount(rs.getInt(4));
                t.setAveragePrice(rs.getFloat(5));
                t.setAverageDistance(rs.getFloat(6));
                zoneList.add(t);
            }

        } catch (Exception e) {
            System.out.println(e);
        } finally {
            resultList.add(zoneList);
        }
    }

    public void writeJsonFile() {
        Gson gson = new Gson();
        String result = "var zoneT = " + gson.toJson(resultList) + ";";
        try {
            FileOutputStream fs = new FileOutputStream("data.js");
            PrintStream out = new PrintStream(fs);
            out.print(result);
        } catch (Exception e) {
            System.out.println(e);
        }
    }

}
