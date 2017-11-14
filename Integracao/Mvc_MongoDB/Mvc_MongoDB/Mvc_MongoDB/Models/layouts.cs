﻿using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System;
using System.ComponentModel.DataAnnotations;

namespace Mvc_MongoDB.Models
{
    public class layouts
    {
        [BsonRepresentation(BsonType.ObjectId)]
        public String id { get; set; }

        [Required]
        [Display(Name = "layoutID")]
        public String layoutID { get; set; }

        [Required]
        [Display(Name = "html")]
        public String html { get; set; }
    }
}