namespace CarRentalSystem.Models;

public class DamageReport
{
    public int DamageReport_ID { get; set; }
    
    public string Description { get; set; }
    
    public DateTime ReortedAtUtc { get; set; }
    
    public decimal RepairCost { get; set; }
}