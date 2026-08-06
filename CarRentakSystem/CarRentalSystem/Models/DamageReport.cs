namespace CarRentalSystem.Models;

public class DamageReport
{
    public int DamageReport_ID { get; set; }

    public string Description { get; set; } = string.Empty;
    
    public DateTime ReortedAtUtc { get; set; }
    
    public decimal RepairCost { get; set; }
    
    // foreign keys 
    
    public int CarId { get; set; }
    public int RentalId { get; set; }

    public Car Car { get; set; } = null!;
    public Rental Rental { get; set; } = null!;



}