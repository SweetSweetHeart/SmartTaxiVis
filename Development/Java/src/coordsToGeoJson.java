import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Date;
import java.util.TimeZone;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class coordsToGeoJson {
	static JSONObject pickupCoords = new JSONObject();
	static JSONObject dropoffCoords = new JSONObject();

	@SuppressWarnings("unchecked")
	public static void main(String[] args) {
		String csvFile = "/Users/Qiru/Downloads/results-20170331-195252.csv";
		BufferedReader br = null;
		String line = "";
		String cvsSplitBy = ",";

		JSONArray groupPickupArray=new JSONArray();
		JSONArray groupDropoffArray=new JSONArray();

		pickupCoords.put("type", "Feature");
		dropoffCoords.put("type", "Feature");
		pickupCoords.put("properties", null);
		dropoffCoords.put("properties", null);

		try {
			br = new BufferedReader(new FileReader(csvFile));
			int i=0;
			while ((line = br.readLine()) != null) {
				JSONArray singlePickupArray = new JSONArray();
				JSONArray singleDropoffArray = new JSONArray();
				// use comma as separator
				String[] str = line.split(cvsSplitBy);
				TimeZone.setDefault(TimeZone.getTimeZone("EST"));
				Date pickup=new Date((long) (Float.parseFloat(str[0])*1000));
				Date dropoff=new Date((long) (Float.parseFloat(str[1])*1000));
				if(!line.trim().isEmpty()){
					singlePickupArray.add(Double.parseDouble(str[2]));
					singlePickupArray.add(Double.parseDouble(str[3]));

					singleDropoffArray.add(Double.parseDouble(str[4]));
					singleDropoffArray.add(Double.parseDouble(str[5]));

					groupPickupArray.add(singlePickupArray);
					groupDropoffArray.add(singleDropoffArray);


				}
			}

		} catch (FileNotFoundException e) {
			e.printStackTrace();
		} catch (IOException e) {
			e.printStackTrace();
		} finally {
			if (br != null) {
				try {
					br.close();
				} catch (IOException e) {
					e.printStackTrace();
				}
			}
		}

		JSONObject geometryObj=new JSONObject();
		geometryObj.put ("coordinates", groupPickupArray);
		geometryObj.put("type", "MultiPoint");
		pickupCoords.put ("geometry", geometryObj);
		dropoffCoords.put ("geometry", geometryObj);
		System.out.println(pickupCoords);
	}

	public static void addMultiPointToJson(JSONArray a){


	}

}
