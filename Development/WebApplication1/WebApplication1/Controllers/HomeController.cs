using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Diagnostics;
using System.Threading;
using System.Web.Mvc;
using WebApplication1.Models;

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

        public string[] RetrieveTopZones(int limit)
        {
            Stopwatch stopwatch = Stopwatch.StartNew();
            Thread.Sleep(500);

            string PUQuery = "call first_cursor("+ limit + ");";


            MySqlCommand cmd = conn.CreateCommand();
            MySqlDataAdapter readPU = new MySqlDataAdapter(PUQuery, conn);
            DataTable PUTable = new DataTable();
            conn.Open();
            readPU.Fill(PUTable);

            var list = new List<JObject>();
            long[] PUArray = new long[PUTable.Rows.Count];
            long[] DOArray = new long[PUTable.Rows.Count];
            string[] JSONArray = new string[PUTable.Rows.Count];
            for (int i = 0; i < PUTable.Rows.Count; i++)
            {
                var pair = new JObject();
                pair["name"] = PUTable.Rows[i][1].ToString();
                list.Add(pair);
                PUArray[i] = Convert.ToInt64(PUTable.Rows[i][2]);
                DOArray[i] = Convert.ToInt64(PUTable.Rows[i][3]);
                JSONArray[i] = PUTable.Rows[i][4].ToString();
            }
            conn.Close();
            //Debug.WriteLine(JsonConvert.SerializeObject(list));
            string[] jsonArray = { JsonConvert.SerializeObject(list), JsonConvert.SerializeObject(PUArray), JsonConvert.SerializeObject(DOArray), JsonConvert.SerializeObject(JSONArray) };
            stopwatch.Stop();
            Debug.WriteLine(stopwatch.ElapsedMilliseconds);

            return jsonArray;
        }
        //public JsonResult AjaxRetrieve()
        //{
        //    string[] jsonArray = RetrieveTopZones(10);
        //    return Json(jsonArray, JsonRequestBehavior.AllowGet);
        //}

        public JsonResult AjaxRetrieveWithLimit(int limit)
        {
            string[] jsonArray = RetrieveTopZones(limit);
            return Json(jsonArray);
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