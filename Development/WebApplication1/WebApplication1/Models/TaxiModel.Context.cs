﻿//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace WebApplication1.Models
{
    using System;
    using System.Data.Entity;
    using System.Data.Entity.Infrastructure;
    
    public partial class TaxiDataEntities : DbContext
    {
        public TaxiDataEntities()
            : base("name=TaxiDataEntities")
        {
        }
    
        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            throw new UnintentionalCodeFirstException();
        }
    
        public virtual DbSet<green_16_dec> green_16_dec { get; set; }
        public virtual DbSet<TaxiZone> TaxiZone { get; set; }
        public virtual DbSet<Stage_PUCount> Stage_PUCount { get; set; }
    }
}
