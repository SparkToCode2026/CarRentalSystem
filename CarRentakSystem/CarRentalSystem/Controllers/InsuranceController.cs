

{


        private CarRentalSystemContext context;

public InsuranceController(CarRentalSystemContext _context)
{
    context = _context;
}

//alternative

// CarRentalSystemContext context = new CarRentalSystemContext();


//Request URL => http://localhost:5071/Insurance/AddInsurance
//Request method => Post
//Request Body => { "PolicyType" : "Full", "Coverage" : "Full coverage",
//                   "Premium" : 150.0,  "Rental_ID" : 2 }
// send request ==>> call function
[HttpPost("AddInsurance")]
public IActionResult AddInsurance(Insurance insurance)
{

    context.Insurances.Add(insurance);
    context.SaveChanges();

    return Ok(insurance.Insurance_ID);
}


//Request URL => http://localhost:5071/Insurance/RemoveInsurance?id=3
//Request method => Delete
//Request Body => empty
// send request ==>> call function
[HttpDelete("RemoveInsurance")]
public IActionResult RemoveInsurance(int id)
{

    Insurance insurance = context.Insurances.FirstOrDefault(i => i.Insurance_ID == id);

    if (insurance == null)
    {
        return NotFound("insurance not found");
    }
    else
    {
        context.Insurances.Remove(insurance);
        context.SaveChanges();
        return Ok("removed successfully");
    }
}


[HttpPatch("UpdateInsurancePremium")]
public IActionResult UpdateInsurancePremium(int id, decimal newPremium)
{
    Insurance insurance = context.Insurances.FirstOrDefault(i => i.Insurance_ID == id);

    insurance.Premium = newPremium;

    context.SaveChanges();

    return Ok();
}

[HttpPatch("UpdateInsuranceRental")]
public IActionResult UpdateInsuranceRental(int id, int newRentalId)
{
    Insurance insurance = context.Insurances.FirstOrDefault(i => i.Insurance_ID == id);

    insurance.Rental_ID = newRentalId;

    context.SaveChanges();

    return Ok();
}


[HttpPut("UpdateInsurance")]
public IActionResult UpdateInsurance(int id, Insurance newInsurance)
{
    Insurance insurance = context.Insurances.FirstOrDefault(i => i.Insurance_ID == id);

    insurance.PolicyType = newInsurance.PolicyType;
    insurance.Coverage = newInsurance.Coverage;
    insurance.Premium = newInsurance.Premium;

    context.SaveChanges();

    return Ok();
}



[HttpGet("GetInsurance")]
public IActionResult GetInsurance(int id)
{
    Insurance insurance = context.Insurances.FirstOrDefault(i => i.Insurance_ID == id);
    return Ok(insurance);
}

[HttpGet("GetAllInsurances")]
public IActionResult GetAllInsurances()
{
    List<Insurance> insurances = context.Insurances.ToList();
    return Ok(insurances);
}

[HttpGet("GetByPolicyType")]
public IActionResult GetByPolicyType(string policyType)
{
    List<Insurance> insurances = context.Insurances.Where(i => i.PolicyType.Contains(policyType)).ToList();
    return Ok(insurances);
}
 
 
    }
}
 