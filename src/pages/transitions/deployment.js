import Link from "next/link";
import { FaChevronDown } from "react-icons/fa";
import { useState } from "react";

export default function Overview() {
  const [showBenefit, setShowBenefit] = useState(null);
  
  const handleClick = (value) => {
    setShowBenefit(showBenefit===value ? null : value);
  };
  
  return (
    <div className='financial-page'>
      <div className='services'>
        <div className='option-header'><Link href="/transitions">Transition Checklists</Link></div>
        <hr />
        <div className='services-option'><Link href="/transitions/deployment">Deployment</Link></div>
        <div className='services-option'><Link href="/transitions/pcs">PCS</Link></div>
        <div className='services-option'><Link href="/transitions/joining">Joining the Military</Link></div>
        <div className='services-option'><Link href="/transitions/retirement">Retirement</Link></div>
      </div>
      <div className='main'>
        <div style={{textAlign:'center'}}>
          <h1 style={{margin:0}}>Pre-Deployment Checklist</h1>
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(0)}>
            <h4>Legal {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===0 &&
            <div className='benefit-expanded' style={{display:'flex'}}>
              <div style={{flex:1, borderRight:'solid 1px darkgrey'}}>
                <h2 style={{textAlign:'center'}}>Will</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Service Member's will is in good standing</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Spouses's will is in good standing</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Create a living will or trust, if desired</h4>
                </div>
                <h2 style={{textAlign:'center'}}>Power of Attorney</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Assign medical power of attorney</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Assign a guardian of your children</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Guardian has access to necessary paperwork and money as needed</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Verify if financial institution requires a General or Special Power of Attorney</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>All POA documentation is in a safe and secure place</h4>
                </div>
                <h2 style={{textAlign:'center'}}>Life Insurance</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Life-insurance plans are current</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Life-insurance beneficiaries are current</h4>
                </div>
              </div>
              <div style={{flex:1}}>
                <h2 style={{textAlign:'center', marginBottom:0}}>Legal Paperwork</h2>
                <h4 style={{textAlign:'center', margin:0}}>Keep important legal documents in a secure place</h4>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>ID cards for all family members</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Birth certificates of all family members</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Marriage license</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Divorce papers</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Adoption papers</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Death certificates of any family members</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Social Security cards for all immediate family members</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Car or other vehicle titles</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Passports that are valid throughout the deployment</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Visas/citizenship paperwork</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Past 5 years of tax returns</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Court documents, such as custody agreements</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Account passwords and security question answers</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Insurance documentation (health, life, homeowners, car, etc.)</h4>
                </div>
              </div>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(1)}>
            <h4>Financial {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===1 &&
            <div className='benefit-expanded' style={{display:'flex'}}>
              <div style={{flex:1, borderRight:'solid 1px darkgrey'}}>
                <h2 style={{textAlign:'center'}}>Income</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Arrange direct deposit of income to checking or savings account</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Confirm dependent access to needed accounts during the deployment</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Familiarize spouse/family members with myPay</h4>
                </div>
                <h2 style={{textAlign:'center', marginBottom:0}}>Bills</h2>
                <h4 style={{textAlign:'center', margin:0}}>Arrange bill payments. Establish automatic payments whenever possible</h4>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Mortgage/Rent</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Water, Electric, Cable, Internet, Trash collection</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Cell phone</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>House/rental/property insurance</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Credit card</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Loan repayments (consolidate if possible)</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Child care</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Storage unit</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Car payments</h4>
                </div>
              </div>
              <div style={{flex:1}}>
                <h2 style={{textAlign:'center'}}>Financial Planning</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Verify most recent LES are accessible</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Discuss with family members what credit cards won't be used during the deployment</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Notify credit card companies that specific cards will be used overseas</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Evaluate if savings plan should be adjusted during deployment</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Share access to safe deposit boxes with family members</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Make arrangements to either submit tax returns early or apply for an extension</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Arrange to pay in advance for once-a-year or periodic expenses</h4>
                </div>
                <h2 style={{textAlign:'center'}}>Share Information with Family</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Account log-in information (usernames, passwords, security questions, etc.)</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Bank account numbers and bank contact information</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Stock/bond portfolio information</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Contact information for military financial aid</h4>
                </div>
              </div>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(2)}>
            <h4>Home and Auto {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===2 &&
            <div className='benefit-expanded' style={{display:'flex'}}>
              <div style={{flex:1, borderRight:'solid 1px darkgrey'}}>
                <h2 style={{textAlign:'center'}}>Home Inspections</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Renter's/homeowner's insurance is current</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Household routine maintenance is current</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Arrangements to renew lease, if applicable</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Have a lawn care plan in place</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Firearms are properly locked and stored</h4>
                </div>
                <h2 style={{textAlign:'center'}}>Vehicle Inspections</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Car and other vehicle insurance are current</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Vehicle titles and registration are accessible and in good standing</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Base and inspection stickers are current</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Routine maintenance is up to date</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Extra sets of car keys are on hand</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Roadside assistance is available for vehicles that remain in use</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Emergency kit is in each car</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Arrangements are made for someone to maintain vehicles that won't be used</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>If storing during deployment, remove all personal items and contact the insurance company</h4>
                </div>
              </div>
              <div style={{flex:1}}>
                <h2 style={{textAlign:'center'}}>Leasing your Home</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Find responsible renters and sign a lease agreement</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Share contact information of family and handyman with renter</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Set up forwarding of your mail to another address</h4>
                </div>
                <h2 style={{textAlign:'center'}}>Vacating your Home</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Turn off the water</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Lower thermostat temperature</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Clean out the refrigerator and remove all trash</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Arrange for someone to check on the home periodically</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Set up mail forwarding or arrange for someone to collect mail</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Prepare the house for seasonal changes as needed</h4>
                </div>
                <h2 style={{textAlign:'center'}}>Cancelling a Lease</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Contact the property manager about cancelling the lease or subletting</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Confirm landlord has an emergency name and contact number</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Move out personal items you opt not to leave in your home</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Set up mail forwarding to another address</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Rent a storage space or make other arrangements for your personal belongings</h4>
                </div>
              </div>
            </div>
          }
        </div>

        <div className='benefit'>
          <div className='benefit-collapsed'
            onClick={() => handleClick(3)}>
            <h4>Family {<FaChevronDown style={{marginLeft:'10px'}}/>}</h4>
          </div>
          {showBenefit===3 &&
            <div className='benefit-expanded' style={{display:'flex'}}>
              <div style={{flex:1, borderRight:'solid 1px darkgrey'}}>
                <h2 style={{textAlign:'center'}}>Family Care</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Complete a Family Care Plan and submit to Commanding Officer</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Inform extended family members and friends of the upcoming deployment</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Explore how family members and friends can provide support to your family</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Connect with similarly situated families and schedule regular check-ins</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Maintain copies of TDY orders at home</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Maintain a copy of immunization and health records at home for children</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Provide a spare house key to a trusted neighbor</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Register children with the local Child Development Center if remaining near base, in case child care is needed</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Ensure military IDs and driver's licenses are still active and won't expire during the deployment</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Arrange other transportation options if family members don't drive</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Arrange transportation for your pets, if your pets will be staying with family or friends</h4>
                </div>
                <h2 style={{textAlign:'center'}}>If your Children are Staying with a Guardian</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Through Power of Attorney, assign guardianship of your children to a trusted person</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Confirm childcare and education plans for children</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Provide copies of TDY orders to children's guardian</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Provide copies of children's health and immunization records</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Outline your children's typical routines</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Provide a list of nearby and emergency contacts</h4>
                </div>
              </div>
              <div style={{flex:1}}>
                <h2 style={{textAlign:'center'}}>Emergency Plan</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Verify family has access to TRICARE Health Plan and TRICARE Dental</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Create a list of emergency contacts (names, phone numbers, e-mail addresses)</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Verify family knows how to contact the Red Cross and Legal Assistance Services</h4>
                </div>
                <h2 style={{textAlign:'center'}}>Communication Plan</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Clarify how and when you will keep in touch with family during the deployment</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Confirm Internet and phone-service capabilities while deployed</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Explore security measures in place preventing communication</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Clarify if you will be able to send or receive packages</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Inform parents or other family members of how to contact command</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Clarify the plan for emergency communication, including what qualifies as an emergency</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Confirm that command has the correct contact information for loved one</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Clarify with command if there will be deployment updates to family members, and how they will be determined</h4>
                </div>
                <h2 style={{textAlign:'center'}}>Adjustment Plan</h2>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Discuss what will need to change about your family's routines once the deployment occurs</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Discuss what will remain the same for your partner, family, or children</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Explore what important dates/events will be missed</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Become familiar with resources available to family members such as FOCUS Project and United Through Reading</h4>
                </div>
                <div className="checklist">
                  <input type="checkbox"></input>
                  <h4>Discuss plans and expectations for coming home and reintegrating into the family after the deployment</h4>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  );
}
