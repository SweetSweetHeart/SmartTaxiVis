using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;
using WebApplication1.Models;

namespace WebApplication1.Views
{
    public class TaxiController : Controller
    {
        private TaxiDataEntities db = new TaxiDataEntities();

        // GET: Taxi
        public ActionResult Index()
        {
            var result = db.green_16_dec.ToList().Take(10);
            StageData();

            return View(result);
        }

        // GET: Taxi/Details/5
        public ActionResult Details(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            green_16_dec green_16_dec = db.green_16_dec.Find(id);
            if (green_16_dec == null)
            {
                return HttpNotFound();
            }
            return View(green_16_dec);
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
        public ActionResult Create([Bind(Include = "entryID,VendorID,lpep_pickup_datetime,lpep_dropoff_datetime,store_and_fwd_flag,RatecodeID,PULocationID,DOLocationID,passenger_count,trip_distance,fare_amount,extra,mta_tax,tip_amount,tolls_amount,ehail_fee,improvement_surcharge,total_amount,trip_type,payment_type")] green_16_dec green_16_dec)
        {
            if (ModelState.IsValid)
            {
                db.green_16_dec.Add(green_16_dec);
                db.SaveChanges();
                return RedirectToAction("Index");
            }

            return View(green_16_dec);
        }

        // GET: Taxi/Edit/5
        public ActionResult Edit(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            green_16_dec green_16_dec = db.green_16_dec.Find(id);
            if (green_16_dec == null)
            {
                return HttpNotFound();
            }
            return View(green_16_dec);
        }

        // POST: Taxi/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see https://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public ActionResult Edit([Bind(Include = "entryID,VendorID,lpep_pickup_datetime,lpep_dropoff_datetime,store_and_fwd_flag,RatecodeID,PULocationID,DOLocationID,passenger_count,trip_distance,fare_amount,extra,mta_tax,tip_amount,tolls_amount,ehail_fee,improvement_surcharge,total_amount,trip_type,payment_type")] green_16_dec green_16_dec)
        {
            if (ModelState.IsValid)
            {
                db.Entry(green_16_dec).State = EntityState.Modified;
                db.SaveChanges();
                return RedirectToAction("Index");
            }
            return View(green_16_dec);
        }

        // GET: Taxi/Delete/5
        public ActionResult Delete(int? id)
        {
            if (id == null)
            {
                return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
            }
            green_16_dec green_16_dec = db.green_16_dec.Find(id);
            if (green_16_dec == null)
            {
                return HttpNotFound();
            }
            return View(green_16_dec);
        }

        // POST: Taxi/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public ActionResult DeleteConfirmed(int id)
        {
            green_16_dec green_16_dec = db.green_16_dec.Find(id);
            db.green_16_dec.Remove(green_16_dec);
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

        public void StageData()
        {

            List<KeyValuePair<int, int>> pairList = new List<KeyValuePair<int, int>>();
            var query = db.green_16_dec.GroupBy(c => c.PULocationID).OrderByDescending(c => c.Key).Take(10);
            foreach (var item in query)
            {
                Debug.WriteLine(item.Key);
            }

            foreach (var zone in db.TaxiZone.ToList())
            {
                int count = db.green_16_dec.Count(t => t.PULocationID == zone.TaxiZoneID);
                pairList.Add(new KeyValuePair<int, int>(zone.TaxiZoneID, count));
            }

        }
    }
}
