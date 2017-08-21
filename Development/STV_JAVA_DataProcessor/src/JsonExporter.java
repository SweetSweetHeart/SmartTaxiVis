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


    private String procedure;
    private String result = "";


    private Connection con;
    private Statement stmt;
    private ResultSet rs;
    private ArrayList<ArrayList<TaxiZone>> zoneResultList = new ArrayList<>();
    private ArrayList<ArrayList<int[]>> matrixResultList = new ArrayList<>();


    public static void main(String[] args) {
        long startTime = System.currentTimeMillis();
        JsonExporter exporter = new JsonExporter();
        exporter.openConnection();
        exporter.setStatement();

        exporter.getZoneData();
        long zone = System.currentTimeMillis() - startTime;
        System.out.println("getZoneData() finished in: " + zone + "ms");

        exporter.getTripMatrix();
        long trip = System.currentTimeMillis() - zone;
        System.out.println("getTripMatrix() finished in: " + trip + "ms");

        exporter.getPriceMatrix();
        long price = System.currentTimeMillis() - trip;
        System.out.println("getPriceMatrix() finished in: " + price + "ms");

        exporter.getDistanceMatrix();
        long distance = System.currentTimeMillis() - price;
        System.out.println("getDistanceMatrix() finished in: " + distance + "ms");

        exporter.writeJsonFile(exporter.getResult());
        exporter.closeConnection();
        long totalTime = System.currentTimeMillis() - startTime;
        System.out.println("Total time taken: " + totalTime + "ms");
    }

    public String getResult() {
        return result;
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

    public boolean setResultSet(String SQL) {
        try {
            rs = getStatement().executeQuery(SQL);
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public ResultSet getResultSet() {
        return rs;
    }


    public void getZoneData() {

        for (int i = 0; i < HOUR2; i++) {
            procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call getTotalCounts(" + procedure + ")");
            convertZoneToList();
        }

        Gson gson = new Gson();
        result += "var zoneT = " + gson.toJson(zoneResultList) + ";\n";
    }

    public void getTripMatrix() {

        for (int i = 0; i < HOUR2; i++) {
            procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call first_cursor_PU_time(" + procedure + ")");
            convertMatrixToList();

            System.out.println("getTripMatrix() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        result += "var tripT = " + gson.toJson(matrixResultList) + ";\n";
        matrixResultList.clear();
    }

    public void getPriceMatrix() {

        for (int i = 0; i < HOUR2; i++) {
            procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call first_cursor_Price_time(" + procedure + ")");

            convertMatrixToList();

            System.out.println("getDistanceMatrix() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        result += "var priceT = " + gson.toJson(matrixResultList) + ";\n";
        matrixResultList.clear();
    }

    public void getDistanceMatrix() {

        for (int i = 0; i < HOUR2; i++) {
            procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call first_cursor_Distance_time(" + procedure + ")");
            convertMatrixToList();

            System.out.println("getDistanceMatrix() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        result += "var distanceT = " + gson.toJson(matrixResultList) + ";\n";
        matrixResultList.clear();
    }

    public void convertZoneToList() {
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
            zoneResultList.add(zoneList);
        }
    }

    public void convertMatrixToList() {
        try {
            ArrayList<int[]> eachZone = new ArrayList<>();
            while (getResultSet().next()) {
                String[] data = rs.getString(2).split(",");
                int[] dataInt = new int[data.length];
                for (int i = 0; i < data.length; i++) {
                    dataInt[i] = (int)(Double.parseDouble(data[i]) * 100);
                }
                eachZone.add(dataInt);
            }
            matrixResultList.add(eachZone);
        } catch (Exception e) {
            System.out.println(e);
        }
    }

    public void writeJsonFile(String input) {
        try {
            FileOutputStream fs = new FileOutputStream("data.js");
            PrintStream out = new PrintStream(fs);
            out.print(input);
        } catch (Exception e) {
            System.out.println(e);
        }
    }
}
