
/**
 * Created by Henry on 20/08/2017.
 */

import Bobject.TaxiZone;
import Bobject.TaxiZoneFloat;
import Bobject.TaxiZoneInt;
import com.google.gson.Gson;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.ArrayList;

public class SQLDataReader {
    //    private final String URL = "jdbc:mysql://45.76.131.144:3306/TaxiData";
    // ssh -L 3306:45.76.131.144:3306 rss
    private final String URL = "jdbc:mysql://localhost:3306/TaxiData";
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


    public String getResult() {
        return result;
    }

    public boolean openConnection() {
        try {
            Class.forName("com.mysql.jdbc.Driver");
            con = DriverManager.getConnection(URL, USERNAME, PASSWORD);
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

    public void getZoneDataByPU() {
        for (int i = 0; i < HOUR2; i++) {
            procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call getZoneByPU(" + procedure + ")");
            convertZoneToList(true);
        }

        Gson gson = new Gson();
        result += "var zonePUT = " + gson.toJson(zoneResultList) + ";\n\n\n\n\n\n";
        zoneResultList.clear();
    }

    public void getZoneDataByAvgPrice() {
        for (int i = 0; i < HOUR2; i++) {
            procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call getZoneByAvgPrice(" + procedure + ")");
            convertZoneToList(false);
        }

        Gson gson = new Gson();
        result += "var zoneAvePriceT = " + gson.toJson(zoneResultList) + ";\n\n\n\n\n\n";
        zoneResultList.clear();
    }

    public void getZoneDataByAvgDistance() {
        for (int i = 0; i < HOUR2; i++) {
            procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call getZoneByAvgDistance(" + procedure + ")");
            convertZoneToList(false);
        }

        Gson gson = new Gson();
        result += "var zoneAvgDistanceT = " + gson.toJson(zoneResultList) + ";\n\n\n\n\n\n";
        zoneResultList.clear();
    }

    public void getTripMatrix() {

        for (int i = 0; i < HOUR2; i++) {
            procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call first_cursor_PU_time(" + procedure + ")");
            convertMatrixToList();

            System.out.println("getTripMatrix() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        result += "var tripT = " + gson.toJson(matrixResultList) + ";\n\n\n\n\n\n";
        matrixResultList.clear();
    }

    public void getPriceMatrix() {

        for (int i = 0; i < HOUR2; i++) {
            procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call first_cursor_Price_time(" + procedure + ")");

            convertMatrixToList();

            System.out.println("getPriceMatrix() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        result += "var priceT = " + gson.toJson(matrixResultList) + ";\n\n\n\n\n\n";
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
        result += "var distanceT = " + gson.toJson(matrixResultList) + ";\n\n\n\n\n\n";
        matrixResultList.clear();
    }

    public void convertZoneToList(boolean type) {
        ArrayList<TaxiZone> zoneList = new ArrayList<>();

        try {

            if (type) {

                while (getResultSet().next()) {
                    TaxiZoneInt t = new TaxiZoneInt();
                    t.setZoneId(rs.getInt(1));
                    t.setZoneName(rs.getString(2));
                    t.setData(rs.getInt(3));
                    zoneList.add(t);
                }
            } else {
                while (getResultSet().next()) {
                    TaxiZoneFloat t = new TaxiZoneFloat();
                    t.setZoneId(rs.getInt(1));
                    t.setZoneName(rs.getString(2));
                    t.setData(rs.getFloat(3));
                    zoneList.add(t);
                }
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
                    dataInt[i] = (int) (Double.parseDouble(data[i]) * 100);
                }
                eachZone.add(dataInt);
            }
            matrixResultList.add(eachZone);
        } catch (Exception e) {
            System.out.println(e);
        }
    }


}
