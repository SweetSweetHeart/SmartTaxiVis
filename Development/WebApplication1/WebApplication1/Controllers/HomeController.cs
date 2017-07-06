using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Threading;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;
using WebApplication1.Models;
using Newtonsoft.Json.Linq;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        private TaxiDataEntities db = new TaxiDataEntities();

        //MySqlConnection conn = new MySqlConnection(@"server=Localhost;user id=root;password=root;persistsecurityinfo=True;database=TaxiData;allowuservariables=True")
        MySqlConnection conn = new MySqlConnection(@"server=Localhost;user id=taxi;password=taxidb;persistsecurityinfo=True;database=TaxiData;allowuservariables=True;port=3309");

        public class Record
        {
            public int id { get; set; }
            public int count { get; set; }
        }


        public ActionResult Index()
        {
            ViewBag.jsonArray = RetrieveTopZones(10);
            return View();
        }
        public void NormalSQL()
        {
            //Stopwatch stopwatch = Stopwatch.StartNew();
            //System.Threading.Thread.Sleep(500);


            string PUQuery = "SELECT count(*) as c, PULocationID FROM TaxiData.green_16_dec where lpep_pickup_datetime>='2016-12-05 7:00:00' && lpep_dropoff_datetime<'2016-12-05 10:00:00' group by PULocationID order by c desc limit 10;";
            string DOQuery = "SELECT count(*) as c, DOLocationID FROM TaxiData.green_16_dec where lpep_pickup_datetime>='2016-12-05 7:00:00' && lpep_dropoff_datetime<'2016-12-05 10:00:00' group by DOLocationID order by c desc limit 10;";
            List<Record> PUList = SQLtoList(PUQuery);
            List<Record> DOList = SQLtoList(DOQuery);
            List<List<int>> list = new List<List<int>>();
            foreach (var p in PUList)
            {

                List<int> list2 = new List<int>();
                foreach (var d in DOList)
                {
                    string query = "SELECT count(*) FROM TaxiData.green_16_dec where lpep_pickup_datetime>='2016-12-05 7:00:00' && lpep_dropoff_datetime<'2016-12-05 10:00:00' && PULocationID =" + p.id + " && DOLocationID=" + d.id + ";";
                    list2.AddRange(SQLtoListInt(query));
                }
                //Debug.WriteLine(JsonConvert.SerializeObject(list2, Formatting.Indented));
                list.Add(list2);
                //Debug.WriteLine("--------");
            }
            Debug.WriteLine(JsonConvert.SerializeObject(list, Formatting.Indented));
            //stopwatch.Stop();
            //Debug.WriteLine(stopwatch.ElapsedMilliseconds);
        }

        public string[] RetrieveTopZones(int limit)
        {
            Stopwatch stopwatch = Stopwatch.StartNew();
            Thread.Sleep(500);

            string PUQuery = @" SELECT
                                    T1.TaxiZoneID, T1.TaxiZoneName, T1.PUNumbers, T2.DONumbers
                                FROM
                                (SELECT
                                    TaxiZoneID, TaxiZoneName, COUNT(*) AS PUNumbers
                                FROM
                                    green_16_dec g, TaxiZone t
                                WHERE
                                    g.PULocationID = t.TaxiZoneID
                                GROUP BY g.PULocationID) T1
                                    INNER JOIN
                                (SELECT
                                    TaxiZoneID, TaxiZoneName, COUNT(*) AS DONumbers
                                FROM
                                    green_16_dec g, TaxiZone t
                                WHERE
                                    g.DOLocationID = t.TaxiZoneID
                                GROUP BY g.DOLocationID) T2 ON T1.TaxiZoneID = T2.TaxiZoneID
                                ORDER BY T1.PUNumbers Desc
                                Limit " + limit + ";";


            MySqlCommand cmd = conn.CreateCommand();
            MySqlDataAdapter readPU = new MySqlDataAdapter(PUQuery, conn);
            DataTable PUTable = new DataTable();
            conn.Open();
            readPU.Fill(PUTable);

            var list = new List<JObject>();
            long[] PUArray = new long[PUTable.Rows.Count];
            long[] DOArray = new long[PUTable.Rows.Count];
            for (int i = 0; i < PUTable.Rows.Count; i++)
            {
                var pair = new JObject();
                pair["name"] = PUTable.Rows[i][1].ToString();
                list.Add(pair);
                PUArray[i] = Convert.ToInt64(PUTable.Rows[i][2]);
                DOArray[i] = Convert.ToInt64(PUTable.Rows[i][3]);
            }

            conn.Close();
            string[] jsonArray = { JsonConvert.SerializeObject(list), JsonConvert.SerializeObject(PUArray), JsonConvert.SerializeObject(DOArray) };
            stopwatch.Stop();
            Debug.WriteLine(stopwatch.ElapsedMilliseconds);

            return jsonArray;
        }


        public List<Record> SQLtoList(string query)
        {
            List<Record> list = new List<Record>();
            try
            {
                conn.Open();
                MySqlCommand cmd = new MySqlCommand(query);
                cmd.Connection = conn;
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {

                    while (reader.Read())
                    {
                        Record r = new Record();
                        r.id = Convert.ToInt32(reader.GetValue(1));
                        r.count = Convert.ToInt32(reader.GetValue(0));
                        list.Add(r);
                    }
                }
            }
            catch (SqlException exp)
            {
                throw new InvalidOperationException("Data could not be read", exp);
            }
            finally
            {
                conn.Close();
            }
            return list;
        }
        public List<int> SQLtoListInt(string query)
        {
            List<int> list = new List<int>();
            try
            {
                conn.Open();
                MySqlCommand cmd = new MySqlCommand(query);
                cmd.Connection = conn;
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        int r = Convert.ToInt32(reader.GetValue(0));
                        list.Add(r);
                    }
                }
            }
            catch (SqlException exp)
            {
                throw new InvalidOperationException("Data could not be read", exp);
            }
            finally
            {
                conn.Close();
            }
            return list;
        }
    }
}