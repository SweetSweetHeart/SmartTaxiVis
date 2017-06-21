using System.Data.Entity;
using System.Linq;
using System.Net;
using System.Web.Mvc;

namespace WebApplication1.Models
{
    public class TaxiController : Controller
    {
        private TaxiEntities db = new TaxiEntities();

        // GET: Taxi
        public ActionResult Index()
        {
            return View(db.yellow_tripdata_2016_08.ToList().Take(100));
        }

        // GET: Taxi/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            yellow_tripdata_2016_08 yellow_tripdata_2016_08 = db.yellow_tripdata_2016_08.Find(id);
            if (yellow_tripdata_2016_08 == null)
            {
                return HttpNotFound();
            }
            return View(yellow_tripdata_2016_08);
        }

        // GET: Taxi/Create
        public ActionResult Create()
        {
            return View();
        }

        // POST: Taxi/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Create([Bind(Include = "id,C_VendorID,tpep_pickup_datetime,tpep_dropoff_datetime,passenger_count,trip_distance,RatecodeID,store_and_fwd_flag,PULocationID,DOLocationID,payment_type,fare_amount,extra,mta_tax,tip_amount,tolls_amount,improvement_surcharge,total_amount")] yellow_tripdata_2016_08 yellow_tripdata_2016_08)
        {
            if (ModelState.IsValid)
            {
                db.yellow_tripdata_2016_08.Add(yellow_tripdata_2016_08);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(yellow_tripdata_2016_08);
        }

        // GET: Taxi/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            yellow_tripdata_2016_08 yellow_tripdata_2016_08 = db.yellow_tripdata_2016_08.Find(id);
            if (yellow_tripdata_2016_08 == null)
            {
                return HttpNotFound();
            }
            return View(yellow_tripdata_2016_08);
        }

        // POST: Taxi/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "id,C_VendorID,tpep_pickup_datetime,tpep_dropoff_datetime,passenger_count,trip_distance,RatecodeID,store_and_fwd_flag,PULocationID,DOLocationID,payment_type,fare_amount,extra,mta_tax,tip_amount,tolls_amount,improvement_surcharge,total_amount")] yellow_tripdata_2016_08 yellow_tripdata_2016_08)
        {
            if (ModelState.IsValid)
            {
                db.Entry(yellow_tripdata_2016_08).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(yellow_tripdata_2016_08);
        }

        // GET: Taxi/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            yellow_tripdata_2016_08 yellow_tripdata_2016_08 = db.yellow_tripdata_2016_08.Find(id);
            if (yellow_tripdata_2016_08 == null)
            {
                return HttpNotFound();
            }
            return View(yellow_tripdata_2016_08);
        }

        // POST: Taxi/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            yellow_tripdata_2016_08 yellow_tripdata_2016_08 = db.yellow_tripdata_2016_08.Find(id);
            db.yellow_tripdata_2016_08.Remove(yellow_tripdata_2016_08);
            db.SaveChanges();
            return RedirectToAction("Index");
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
