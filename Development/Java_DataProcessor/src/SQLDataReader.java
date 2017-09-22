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
    private final String URL = "jdbc:mysql://212.47.229.69:3306/TaxiData";
    private final String USERNAME = "root";
    private final String PASSWORD = "root";

    private final int TOTALZONE = 263;
    //private final int HOUR1 = 0;
    private final int HOUR2 = 24;
    private final int TIMEOUT = 10000;

    private String m_Procedure;
    private String m_Result = "";

    private Connection m_Connection;
    private Statement m_Statement;
    private ResultSet m_ResultSet;
    private ArrayList<ArrayList<TaxiZone>> m_Zone_ResultList = new ArrayList<>();
    private ArrayList<ArrayList<int[]>> m_Data_ResultList = new ArrayList<>();

    public static void main(String[] args) {
        long startTime = System.currentTimeMillis();

        SQLDataReader dataReader = new SQLDataReader();

        dataReader.openConnection();
        dataReader.setStatement();


        dataReader.getZoneDataByDO();
        dataReader.getZoneDataByPU();
        dataReader.getZoneDataByAvgPrice();
        dataReader.getZoneDataByAvgDistance();

        dataReader.getPUTripMatrix();
        dataReader.getDOTripMatrix();
        dataReader.getPriceMatrix();
        dataReader.getDistanceMatrix();

        dataReader.closeConnection();

        JsonWriter jsonWriter = new JsonWriter();
        jsonWriter.writeJsonFile(dataReader.getResult());

        long totalTime = System.currentTimeMillis() - startTime;

        System.out.println("Total time taken: " + totalTime + "ms");
    }

    public String getResult() {
        return m_Result;
    }

    public boolean openConnection() {
        try {
            Class.forName("com.mysql.jdbc.Driver");
            m_Connection = DriverManager.getConnection(URL, USERNAME, PASSWORD);
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public boolean closeConnection() {
        try {
            m_Connection.close();
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public boolean setStatement() {
        try {
            m_Statement = m_Connection.createStatement();
            m_Statement.setQueryTimeout(TIMEOUT);
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public Statement getStatement() {
        return m_Statement;
    }

    public boolean setResultSet(String SQL) {
        try {
            m_ResultSet = getStatement().executeQuery(SQL);
        } catch (Exception e) {
            System.out.println(e);
        } finally {
            return true;
        }
    }

    public ResultSet getResultSet() {
        return m_ResultSet;
    }

    public void getZoneDataByPU() {
        for (int i = 0; i < HOUR2; i++) {
            m_Procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call getZoneByPU(" + m_Procedure + ")");
            convertZoneToList(true);

            System.out.println("getZoneDataByPU() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        m_Result += "var ZONE_PU_MATRIX = " + gson.toJson(m_Zone_ResultList) + ";\n\n\n\n\n\n";
        m_Zone_ResultList.clear();
    }

    public void getZoneDataByDO() {
        for (int i = 0; i < HOUR2; i++) {
            m_Procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call getZoneByDO(" + m_Procedure + ")");
            convertZoneToList(true);

            System.out.println("getZoneDataByDO() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        m_Result += "var ZONE_DO_MATRIX = " + gson.toJson(m_Zone_ResultList) + ";\n\n\n\n\n\n";
        m_Zone_ResultList.clear();
    }

    public void getZoneDataByAvgPrice() {
        for (int i = 0; i < HOUR2; i++) {
            m_Procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call getZoneByAvgPrice(" + m_Procedure + ")");
            convertZoneToList(false);

            System.out.println("getZoneDataByAvgPrice() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        m_Result += "var ZONE_AVG_PRICE_MATRIX = " + gson.toJson(m_Zone_ResultList) + ";\n\n\n\n\n\n";
        m_Zone_ResultList.clear();
    }

    public void getZoneDataByAvgDistance() {
        for (int i = 0; i < HOUR2; i++) {
            m_Procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call getZoneByAvgDistance(" + m_Procedure + ")");
            convertZoneToList(false);

            System.out.println("getZoneDataByAvgDistance() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        m_Result += "var ZONE_AVG_DISTANCE_MATRIX = " + gson.toJson(m_Zone_ResultList) + ";\n\n\n\n\n\n";
        m_Zone_ResultList.clear();
    }

    public void getPUTripMatrix() {

        for (int i = 0; i < HOUR2; i++) {
            m_Procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call first_cursor_PU_time(" + m_Procedure + ")");
            convertMatrixToList(false);

            System.out.println("getPUTripMatrix() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        m_Result += "var PU_MATRIX = " + gson.toJson(m_Data_ResultList) + ";\n\n\n\n\n\n";
        m_Data_ResultList.clear();
    }

    public void getDOTripMatrix() {

        for (int i = 0; i < HOUR2; i++) {
            m_Procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call first_cursor_DO_time(" + m_Procedure + ")");
            convertMatrixToList(false);

            System.out.println("getDOTripMatrix() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        m_Result += "var DO_MATRIX = " + gson.toJson(m_Data_ResultList) + ";\n\n\n\n\n\n";
        m_Data_ResultList.clear();
    }

    public void getPriceMatrix() {

        for (int i = 0; i < HOUR2; i++) {
            m_Procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call first_cursor_Price_time(" + m_Procedure + ")");

            convertMatrixToList(true);

            System.out.println("getPriceMatrix() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        m_Result += "var PRICE_MATRIX = " + gson.toJson(m_Data_ResultList) + ";\n\n\n\n\n\n";
        m_Data_ResultList.clear();
    }

    public void getDistanceMatrix() {

        for (int i = 0; i < HOUR2; i++) {
            m_Procedure = TOTALZONE + "," + i + "," + (i + 1);
            setResultSet("call first_cursor_Distance_time(" + m_Procedure + ")");
            convertMatrixToList(true);

            System.out.println("getDistanceMatrix() " + (i + 1) + "th loop");
        }

        Gson gson = new Gson();
        m_Result += "var DISTANCE_MATRIX = " + gson.toJson(m_Data_ResultList) + ";\n\n\n\n\n\n";
        m_Data_ResultList.clear();
    }

    public void convertZoneToList(boolean type) {
        ArrayList<TaxiZone> zoneList = new ArrayList<>();

        try {
            if (type) {
                while (getResultSet().next()) {
                    TaxiZoneInt t = new TaxiZoneInt();
                    t.setZoneId(m_ResultSet.getInt(1));
                    t.setZoneName(m_ResultSet.getString(2));
                    t.setData(m_ResultSet.getInt(3));
                    zoneList.add(t);
                }
            }
            else {
                while (getResultSet().next()) {
                    TaxiZoneFloat t = new TaxiZoneFloat();
                    t.setZoneId(m_ResultSet.getInt(1));
                    t.setZoneName(m_ResultSet.getString(2));
                    t.setData(m_ResultSet.getFloat(3));
                    zoneList.add(t);
                }
            }

        } catch (Exception e) {
            System.out.println(e);
        } finally {
            m_Zone_ResultList.add(zoneList);
        }
    }

    public void convertMatrixToList(boolean dataFixer) {
        try {
            ArrayList<int[]> eachZone = new ArrayList<>();
            while (getResultSet().next()) {
                String[] data = m_ResultSet.getString(2).split(",");
                int[] dataInt = new int[data.length];
                if (dataFixer) {
                    for (int i = 0; i < data.length; i++) {
                        dataInt[i] = (int) (Double.parseDouble(data[i]) * 100);
                    }
                }
                else {
                    for (int i = 0; i < data.length; i++) {
                        dataInt[i] = Integer.parseInt(data[i]);
                    }
                }
                eachZone.add(dataInt);
            }
            m_Data_ResultList.add(eachZone);
        } catch (Exception e) {
            System.out.println(e);
        }
    }

}
