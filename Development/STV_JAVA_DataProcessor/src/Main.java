public class Main {
    public static void main(String[] args) {
        long startTime = System.currentTimeMillis();

        SQLDataReader dataReader = new SQLDataReader();

        dataReader.openConnection();
        dataReader.setStatement();

        dataReader.getZoneDataByPU();
        dataReader.getZoneDataByAvgPrice();
        dataReader.getZoneDataByAvgDistance();

        dataReader.getTripMatrix();
        dataReader.getPriceMatrix();
        dataReader.getDistanceMatrix();

        dataReader.closeConnection();

        JsonWriter jsonWriter = new JsonWriter();
        jsonWriter.writeJsonFile(dataReader.getResult());

        long totalTime = System.currentTimeMillis() - startTime;
        
        System.out.println("Total time taken: " + totalTime + "ms");
    }
}
