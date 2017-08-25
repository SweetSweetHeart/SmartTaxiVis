
/**
 * Created by Henry on 20/08/2017.
 */

import Bobject.TaxiZone;
import Bobject.TaxiZoneFloat;
import Bobject.TaxiZoneInt;
import com.google.m_gson.Gson;

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

    private String PROCEDURE;
    private String RESULT = "";

    private Connection CONNECTION;
    private Statement STATEMENT;
    private ResultSet RESULTSET;
    private ArrayList<ArrayList<TaxiZone>> ZONERESULTLIST = new ArrayList<>();
    private ArrayList<ArrayList<int[]>> MATRIXRESULTLIST = new ArrayList<>();

    public String getResult() {
        return RESULT;
    }

    public boolean openConnection() {
        try {
            Class.forName("com.mysql.jdbc.Driver");
            CONNECTION = DriverManager.getConnection(URL, USERNAME, PASSWORD);
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public boolean closeConnection() {
        try {
            CONNECTION.close();
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public boolean setStatement() {
        try {
            STATEMENT = CONNECTION.createStatement();
            STATEMENT.setQueryTimeout(TIMEOUT);
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public Statement getStatement() {
        return STATEMENT;
    }

    public boolean setResultSet(String SQL) {
        try {
            RESULTSET = getStatement().executeQuery(SQL);
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public ResultSet getResultSet() {
        return RESULTSET;
    }

    public void getZoneDataByPU() {
        for (int i = 0; i < HOUR2; i++) {
            PROCEDURE = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call getZoneByPU(" + PROCEDURE + ")");
            convertZoneToList(true);
        }

        Gson m_gson = new Gson();
        RESULT += "var ZONE_PUMATRIX = " + m_gson.toJson(ZONERESULTLIST) + ";\n\n\n\n\n\n";
        ZONERESULTLIST.clear();
    }

    public void getZoneDataByAvgPrice() {
        for (int i = 0; i < HOUR2; i++) {
            PROCEDURE = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call getZoneByAvgPrice(" + PROCEDURE + ")");
            convertZoneToList(false);
        }

        Gson m_gson = new Gson();
        RESULT += "var ZONE_AVG_PRICEMATRIX = " + m_gson.toJson(ZONERESULTLIST) + ";\n\n\n\n\n\n";
        ZONERESULTLIST.clear();
    }

    public void getZoneDataByAvgDistance() {
        for (int i = 0; i < HOUR2; i++) {
            PROCEDURE = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call getZoneByAvgDistance(" + PROCEDURE + ")");
            convertZoneToList(false);
        }

        Gson m_gson = new Gson();
        RESULT += "var ZONE_AVG_DISTANCEMATRIX = " + m_gson.toJson(ZONERESULTLIST) + ";\n\n\n\n\n\n";
        ZONERESULTLIST.clear();
    }

    public void getTripMatrix() {

        for (int i = 0; i < HOUR2; i++) {
            PROCEDURE = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call first_cursor_PU_time(" + PROCEDURE + ")");
            convertMatrixToList();

            System.out.println("getTripMatrix() " + (i + 1) + "th loop");
        }

        Gson m_gson = new Gson();
        RESULT += "var TRIPMATRIX = " + m_gson.toJson(MATRIXRESULTLIST) + ";\n\n\n\n\n\n";
        MATRIXRESULTLIST.clear();
    }

    public void getPriceMatrix() {

        for (int i = 0; i < HOUR2; i++) {
            PROCEDURE = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call first_cursor_Price_time(" + PROCEDURE + ")");

            convertMatrixToList();

            System.out.println("getPriceMatrix() " + (i + 1) + "th loop");
        }

        Gson m_gson = new Gson();
        RESULT += "var PRICEMATRIX = " + m_gson.toJson(MATRIXRESULTLIST) + ";\n\n\n\n\n\n";
        MATRIXRESULTLIST.clear();
    }

    public void getDistanceMatrix() {

        for (int i = 0; i < HOUR2; i++) {
            PROCEDURE = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call first_cursor_Distance_time(" + PROCEDURE + ")");
            convertMatrixToList();

            System.out.println("getDistanceMatrix() " + (i + 1) + "th loop");
        }

        Gson m_gson = new Gson();
        RESULT += "var DISTANCEMATRIX = " + m_gson.toJson(MATRIXRESULTLIST) + ";\n\n\n\n\n\n";
        MATRIXRESULTLIST.clear();
    }

    public void convertZoneToList(boolean type) {
        ArrayList<TaxiZone> m_zoneList = new ArrayList<>();

        try {
            if (type) {
                while (getResultSet().next()) {
                    TaxiZoneInt t = new TaxiZoneInt();
                    t.setZoneId(RESULTSET.getInt(1));
                    t.setZoneName(RESULTSET.getString(2));
                    t.setData(RESULTSET.getInt(3));
                    m_zoneList.add(t);
                }
            } else {
                while (getResultSet().next()) {
                    TaxiZoneFloat t = new TaxiZoneFloat();
                    t.setZoneId(RESULTSET.getInt(1));
                    t.setZoneName(RESULTSET.getString(2));
                    t.setData(RESULTSET.getFloat(3));
                    m_zoneList.add(t);
                }
            }

        } catch (Exception e) {
            System.out.println(e);
        } finally {
            ZONERESULTLIST.add(m_zoneList);
        }
    }

    public void convertMatrixToList() {
        try {
            ArrayList<int[]> m_eachZone = new ArrayList<>();
            while (getResultSet().next()) {
                String[] m_data = RESULTSET.getString(2).split(",");
                int[] m_dataInt = new int[m_data.length];
                for (int i = 0; i < m_data.length; i++) {
                    m_dataInt[i] = (int) (Double.parseDouble(m_data[i]) * 100);
                }
                m_eachZone.add(m_dataInt);
            }
            MATRIXRESULTLIST.add(m_eachZone);
        } catch (Exception e) {
            System.out.println(e);
        }
    }

}
