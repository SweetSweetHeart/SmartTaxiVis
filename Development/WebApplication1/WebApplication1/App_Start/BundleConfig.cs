using System.Web;
using System.Web.Optimization;

namespace WebApplication1
{
    public class BundleConfig
    {
        // For more information on bundling, visit https://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-3.1.1.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at https://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));

            bundles.Add(new ScriptBundle("~/bundles/nouislider").Include(
                      "~/Scripts/nouislider.js",
                      "~/Scripts/wNumb.js"));

            bundles.Add(new ScriptBundle("~/bundles/d3").Include(
                      "~/Scripts/d3.v2.min.js"));

            bundles.Add(new ScriptBundle("~/bundles/anymap").Include(
                      "~/Scripts/anychart-bundle.min.js",
                      "~/Scripts/proj4.js",
                      "~/Scripts/taxizones.js"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                      "~/Scripts/bootstrap.js",
                      "~/Scripts/font-awesome.js"));

            bundles.Add(new StyleBundle("~/Content/css").Include(
                      "~/Content/Site.css",
                      "~/Content/bootstrap.css",
                      "~/Content/font-awesome.css"));

            bundles.Add(new StyleBundle("~/Content/nouislider").Include(
                      "~/Content/nouislider.css"));

            bundles.Add(new StyleBundle("~/Content/anymap").Include(
                      "~/Content/anychart-ui.min.css",
                      "~/Content/anychart.css"));
        }
    }
}
