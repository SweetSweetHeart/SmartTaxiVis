using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using WebApplication1.Models;

namespace WebApplication1.Controllers
{
    public class HomeController : Controller
    {
        //private nyc_taxiEntities db = new nyc_taxiEntities();

        public ActionResult Index()
        {
           // ViewData.Model = db.yellow_tripdata_2016_08.ToList().Take(10);
            return View();
        }
    }
}