import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.util.Date;
import java.util.TimeZone;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;

public class coordsToGeoJsonWithTime {
	static JSONObject pickupCoords = new JSONObject();
	static JSONObject dropoffCoords = new JSONObject();

	@SuppressWarnings("unchecked")
	public static void main(String[] args) {
		String csvFile = "/Users/Qiru/Downloads/results-20170331-195252.csv";
		BufferedReader br = null;
		String line = "";
		String cvsSplitBy = ",";

		pickupCoords.put("type", "FeatureCollection");
		dropoffCoords.put("type", "FeatureCollection");

		JSONArray pickupFeatures = new JSONArray();
		JSONArray dropoffFeatures = new JSONArray();


		try {
			br = new BufferedReader(new FileReader(csvFile));
			int i=0;
			while ((line = br.readLine()) != null) {
				//		i++;
				// use comma as separator
				String[] str = line.split(cvsSplitBy);
				TimeZone.setDefault(TimeZone.getTimeZone("EST"));
				Date pickup=new Date((long) (Float.parseFloat(str[0])*1000));
				Date dropoff=new Date((long) (Float.parseFloat(str[1])*1000));
				if(!line.trim().isEmpty()){					
					JSONObject pickupFeature = new JSONObject();
					JSONObject dropoffFeature = new JSONObject();

					pickupFeature.put("type", "Feature");
					dropoffFeature.put("type", "Feature");

					JSONObject pickupProperties = new JSONObject();
					JSONObject dropoffProperties = new JSONObject();

					pickupProperties.put("Pickup Time", pickup.toString());
					dropoffProperties.put("Dropoff Time", dropoff.toString());

					pickupFeature.put("properties", pickupProperties);
					dropoffFeature.put("properties", dropoffProperties);

					JSONObject pickupGeometry = new JSONObject();
					JSONObject dropoffGeometry = new JSONObject();

					pickupGeometry.put("type", "Point");
					dropoffGeometry.put("type", "Point");

					JSONArray pickupCoordArray=new JSONArray();
					JSONArray dropoffCoordArray=new JSONArray();

					pickupCoordArray.add(Double.parseDouble(str[2]));
					pickupCoordArray.add(Double.parseDouble(str[3]));

					dropoffCoordArray.add(Double.parseDouble(str[4]));
					dropoffCoordArray.add(Double.parseDouble(str[5]));

					pickupGeometry.put("coordinates", pickupCoordArray);
					dropoffGeometry.put("coordinates", dropoffCoordArray);					

					pickupFeature.put("geometry", pickupGeometry);
					dropoffFeature.put("geometry", dropoffGeometry);

					pickupFeatures.add(pickupFeature);
					dropoffFeatures.add(dropoffFeature);
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


		pickupCoords.put("features", pickupFeatures);
		dropoffCoords.put("features", dropoffFeatures);
		System.out.println(pickupCoords);
	}
}
