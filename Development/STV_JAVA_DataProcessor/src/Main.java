public class Main {
    public static void main(String[] args) {
        long m_startTime = System.currentTimeMillis();

        SQLDataReader m_dataReader = new SQLDataReader();

        m_dataReader.openConnection();
        m_dataReader.setStatement();

        m_dataReader.getZoneDataByPU();
        m_dataReader.getZoneDataByAvgPrice();
        m_dataReader.getZoneDataByAvgDistance();

        m_dataReader.getTripMatrix();
        m_dataReader.getPriceMatrix();
        m_dataReader.getDistanceMatrix();

        m_dataReader.closeConnection();

        JsonWriter m_jsonWriter = new JsonWriter();
        m_jsonWriter.writeJsonFile(m_dataReader.getResult());

        long m_totalTime = System.currentTimeMillis() - m_startTime;

        System.out.println("Total time taken: " + m_totalTime + "ms");
    }
}
