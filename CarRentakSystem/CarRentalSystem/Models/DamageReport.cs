namespace CarRentalSystem.Models;

public class DamageReport
{
    public int Id { get; set; }
    
    public string Description { get; set; }
    
    public DateTime ReortedAtUtc { get; set; }
    
    public decimal RepairCost { get; set; }
}