/**
 * Created by Henry on 20/08/2017.
 */
public class TaxiZone {
    public int ZoneId;
    public String ZoneName;
    public int PickUpCount;
    public int DropOffCount;
    public float AveragePrice;
    public float AverageDistance;

    public int getZoneId() {
        return ZoneId;
    }

    public void setZoneId(int zoneId) {
        ZoneId = zoneId;
    }

    public String getZoneName() {
        return ZoneName;
    }

    public void setZoneName(String zoneName) {
        ZoneName = zoneName;
    }

    public int getPickUpCount() {
        return PickUpCount;
    }

    public void setPickUpCount(int pickUpCount) {
        PickUpCount = pickUpCount;
    }

    public int getDropOffCount() {
        return DropOffCount;
    }

    public void setDropOffCount(int dropOffCount) {
        DropOffCount = dropOffCount;
    }

    public float getAveragePrice() {
        return AveragePrice;
    }

    public void setAveragePrice(float averagePrice) {
        AveragePrice = averagePrice;
    }

    public float getAverageDistance() {
        return AverageDistance;
    }

    public void setAverageDistance(float averageDistance) {
        AverageDistance = averageDistance;
    }
}
