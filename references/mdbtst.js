var MongoClient = require('mongodb').MongoClient,
   	assert = require('assert');

// Connection URL
var url = 'mongodb://tst.tourbooks.cc:27017/rubedo';

var products = [{
		"productType": "ACTIVITY",
		"name": "Sydney Harbour and Coastal 20 Min Shared Scenic Helicopter Flight",
		"shortDescription": "See the view that makes Sydney so famous, from the middle of the harbour looking at the City, The Opera House and the stunning Harbour Bridge, before returning back to Sydney Airport with the memories of a lifetime.",
		"description": "See Sydney and its coastal wonders, in this spectacular scenic flight in a luxury Helicopter. &nbsp;Depart our private lounge at Sydney's Mascot airport, and head straight to the coast and the amazing homes that abound the dramatic cliffs along Maroubra and Coogee. Tracking north you're soon over the world renowned Bondi Beach, and its crystal clear waters before passing South head into Sydney harbour.&nbsp;See the view that makes Sydney so famous, from the middle of the harbour looking at the City, The Opera House and the stunning Harbour Bridge, before returning back to Sydney airport with the memories of a lifetime. A Sydney first ! Individual Tickets Available.",
		"productCode": "PXCHA7",
		"internalCode": "sydss1",
		"supplierId": 5544,
		"supplierAlias": "heliexperiences",
		"supplierName": "Heli Experiences",
		"timezone": "Australia/Sydney",
		"advertisedPrice": 169,
		"priceOptions": [{
			"id": 34829,
			"price": 169,
			"label": "Quantity",
			"seatsUsed": 1
		}],
		"currency": "AUD",
		"unitLabel": "Participant",
		"unitLabelPlural": "Participants",
		"quantityRequired": true,
		"quantityRequiredMin": 1,
		"quantityRequiredMax": 4,
		"images": [{
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/5544/HeliExp_Syd_123.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/5544/HeliExp_Syd_123_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/5544/HeliExp_Syd_123_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/5544/HeliExp_Syd_123_lg.jpg"
		}],
		"bookingMode": "INVENTORY",
		"charter": false,
		"terms": "",
		"generalTerms": "TERMS AND CONDITIONS\r\n\r\nAll transactions are processed in AUD$\r\n\r\nDEFINITIONS:“The Company” means Heli Experiences its servants, agents, successors and assigns. “The Passenger” means jointly and severally the person or company or group of persons or companies contracting with The Company and extends to his her its or their heirs, successors and assigns.\r\n\r\nPAYMENT POLICY: All payments will be transacted before the tour unless prior agreement is made for payment terms, which are strictly 14 days from day of invoice. Please advise payment by email to bookings@heliexperiences.com.\r\n\r\nCANCELLATION BY THE PASSENGER FOR SCENIC FLIGHTS BOOKED DIRECT WITH THE COMPANY: All cancellations must be in writing and addressed to The Company. There are no cancellations available for flights that have been postponed or rebooked from a postponed flight.\r\n\r\nLess than 21 business working days prior to departure - 25% of full fare\r\nLess than 14 business working days prior to departure - 50% of full fare\r\nLess than 7 business working days prior to departure - 100% of full fare\r\nA business working day is defined as any ordinary working day between monday to friday not including weekend days.\r\n\r\nGROUP BOOKING PAYMENT POLICY: Balance of 100% payments will be transacted 30 days before the tour unless prior agreement is made for payment terms. if 100% not received at least 30 days before the tour, the tour will be considered cancelled by the passengers or agents of passengers. Please advise payment by email to bookings@heliexperiences.com\r\n\r\nGROUP BOOKING AND CANCELLATION BY THE AGENT FOR SCENIC AND CHARTER FLIGHTS: A group is defined as 8 or more passengers. All cancellations must be in writing and addressed to The Company. There is  25% non-refundable deposit required to confirm a group charter upon booking. Cancellation fees are the following;\r\n\r\nLess than 30 days prior to departure - additional 25% of Full Charter Cost.\r\nLess than 21 days prior to departure - additional 50% of Full Charter Cost.\r\n\r\nGIFT VOUCHER VALIDITY: Gift vouchers are valid for 12 months and cannot be exchanged for cash and no refunds are available after the applicable cooling off period.\r\n\r\nBEST PRICE GUARANTEE: The company guarantees that any of its online products published on the Company website that display best price guarantee shall be the lowest rate available from the Company and the Company's resellers. Should the customer find and prove by providing a current link for a legitimate lower rate for the product elsewhere on the internet then the Company will beat that rate by 5%. The comparison rate must be for a current date range and valid for flight at the same date and for the same amount of passengers per flight. The best price guarantee does not include lower rates provided by the company or any other company from past years.\r\n\r\nINSTRUCTIONAL FLIGHTS POSTPONEMENT REQUESTS BY THE PASSENGER: All training flights can be postponed by the customer up to 7 days before the confirmed flight time for a change fee of $50. Requests within 7 days of confirmed flight time for postponement for any reason whatsoever are not allowed. Passenger No Shows and passengers who have missed their confirmed flights for any reason whatsoever forfeit their tickets and are not entitled to fly again or receive a refund. Name changes are allowed up to 48 hrs before the confirmed flight time, the weight of the new named passenger must be equal to or less than the former named booked passenger. There is no fee for name changes.\r\n\r\nMAXIMUM PASSENGER WEIGHTS: For 1 Person Bookings on Training Instructional Flights individual Passenger Weight must Not Exceed 120Kg, All Pax are weighed pre flight. For 1+ Person Bookings on Share Flights individual Passenger Weight must Not Exceed 110Kg, All Pax are weighed pre flight. Should a passenger misrepresent their weight upon booking and found to be over the allocated weight pre flight, the passenger may be prevented from boarding the aircraft by The Company Ground Staff/Pilot and their seat/flight and any monies paid for that seat/flight will be forfeited.\r\n\r\nMINIMUM PASSENGER NUMBERS SHARED FLIGHTS: Shared flights can only depart with full passenger numbers on board. This is due to the fare type and operational costs. If you shared flight is not full you will be contacted prior and offered other times and/or dates. There are no refunds available for shared flights postponed due to insufficient passenger numbers.\r\n\r\nSCENIC FLIGHT POSTPONEMENT REQUESTS BY THE PASSENGER: All scenic flights can be postponed by the customer up to 48 hrs before the confirmed flight time for a change fee of $50 pp. Requests within 48 hrs of confirmed flight time for postponement for any reason whatsoever are not allowed. Passenger No Shows and passengers who have missed their confirmed flights for any reason whatsoever forfeit their tickets and are not entitled to fly again or receive a refund.\r\n\r\nREFUNDS: Refunds are at the sole discretion of the company. Refunds are not available for services provided but not utilised by The Passenger. Please choose carefully. We do not normally give refunds if you simply change your mind or make a wrong decision. Refunds are not available for confirmed flights that have been postponed for any reason including weather or confirmed flights that have been put on hold for any reason. Refunds are not available to passengers that choose not to participate on the day of their confirmed booking for any reason whatsoever. Refunds are not available for flights that may depart at different times then advertised and/or confirmed due to any reason.\r\n\r\nUPGRADES: The company personnel may offer upgrades to passengers at it's own discretion. This may include seating arrangements and extra time or larger aircraft type. If the upgrade is provided free of any extra charge to the customer, the company reserves the right to not provide the upgrade at any stage prior to the flight and to carry the passengers as per their confirmed ticket type. This maybe because of altered seating arrangements, air traffic control directions or weight and balance of passengers determining seating or late bookings of fully paid preferential seating such as front seat guarantee. There is no refund available for upgrades provided free of charge that are not provided and in that circumstance the customers paid ticket type will be subject to the company's normal terms and conditions.\r\n\r\nFRONT AND WINDOW SEAT GUARANTEE: Both seats types are subject to availability due to limited seating options in helicopters. A passenger requesting a guaranteed seat is not confirmed a guaranteed seat. Upon receipt of payment passengers must be allocated the guaranteed seat they have paid for or otherwise offered alternative arrangements with a refund of the guarantee surcharge payment. A request for a guaranteed seat is only a considered a request until that time that it is confirmed by full payment. The company will accept no liability for changes of seating except for the refund entitlement of the surcharge paid by the passenger.\r\n\r\nPART REFUNDS FLIGHT TIME VARIATION: Where a passenger has participated on a flight and the flight for whatever reason has not flown for the stipulated time, the passenger will be entitled to a refund directly corresponding to the amount of time that was not provided. For the avoidance of doubt, if you purchase a 30 min scenic flight and the flight durantion is 25 mins, then you are entitled to a refund for 5 mins. Flight times can vary due to air traffic control, weather, reservations error, passenger medical reasons and aircraft malfunction.\r\n\r\nONLINE PURCHASE REFUNDS AND RETURNS POLICY:All voucher purchases have a 24 hour cooling off period. If a customer wishes to return a voucher for a full refund, the customer must notify Heli Experiences within 24 hours of the time of purchase.\r\n\r\nREFUND REQUESTS WHEN TICKET BOOKED THROUGH 3RD PARTY:\r\nWhere a ticket is booked and paid via a third party; defined as but not limited to a travel agent, online booking service or voucher provider, wholesaler, inbound tour operator or any other third party entity that is not owned by the company and/or the ticket is not booked directly and paid directly to the company, all refund requests must be directed to the point of purchase. The reason for this is the company may not have been paid the full amount of the purchase price. Where the third party service is embedded in the company's website, or payment has been made directly to the company then the company is responsible for refunds subject to the company's refund policy contained within the company's terms and conditions. Where a 3rd Party sells the tickets subject to The Company Terms and Conditions then The Company Terms and Conditions shall prevail.\r\n\r\nSHARE FLIGHT REQUESTS FROM VIATOR, RED BALLOON, ADRENALIN AND ANY OTHER 3RD PARTY AGENT: Shared flights only depart when all seats in the allocated helicopter are full. If you are booked on a share flight and the share flight is not full your flight will be postponed. Whilst every effort will be made to provide the journey, trip or tour offered at the time requested, The Company cannot guarantee exact times to match a customer request. The Company reserves the right to confirm any share flight request within a reasonable time frame of the customers requested time window. The Company considers a reasonable time variation window as 1 hr before or after the requested start time and 1 hr before or after the requested end time. The Company Reservations team will ring you only if you are to be confirmed outside this window.  The Company explicity does not guarantee confirmation within requested times. Reasons for this is the complexity of matching passengers together according to different flight paths, different weight and balance of the helicopters, air traffic control instructions, number of share flight requests (over 15,000 a year) and other reasons outside the control of The Company. For the avoidance of doubt; If the customer requests a flight between 1pm and 2 pm, the Company could confirm the request between 12pm and 3 pm. On most occasions if the customer has provided a large enough window the customer will be confirmed within that window. If the customer wants an exact time, or is unavailable outside their time request window it is highly recommended that they inform The Company in the customer notes section of the request.\r\n\r\nDIRECT BOOKINGS WITH COMPANY ALTERATIONS TO CONFIRMED BOOKINGS AND TRAVEL ARRANGEMENTS: Whilst every effort will be made to provide the journey, trip or tour offered at the time requested and confirmed, the Company nevertheless must retain the right to change, modify, alter or cancel any request or arrangement if they can not be provided for any reason. The Company accepts no liability or responsibility where delays, changes to flight departure times, cancellations, price increases or other alterations have been caused by circumstances beyond its control, including but not limited to delays, interruptions, share flight passenger matching or changes due to weather conditions, technical problems with transport, industrial action, natural disasters, riots, terrorist activities, airport closures or other breakdowns in arrangements. The Company shall not in any circumstances be held liable for and will not accept responsibility or liability for acts, omissions, defaults or failures on the part of transportation companies, hotel contractors and the like, who may provide you with services and facilities at the request of The Company. The Company in such circumstances acts only as your agent to introduce you to the companies, persons, accommodation contractors and the like who provide such services and facilities. Acceptance of these arrangements is a condition of booking. It is essential that you ensure that The Company is informed of a contact telephone number or address where you can be reached immediately prior to departure. Should however the Company become aware any time prior to departure that due to weather warnings or any other reason the helicopter will be unable to execute all legs of the journey the company will offer the customer alternative arrangements and/or itinerary details or at the discretion of the Company a 100% full refund which will be returned to the customer via electronic funds transfer upon company cancellation of the booking.\r\n\r\nCUSTOMER FEEDBACK AND COMPLAINTS: The company does not discuss feedback or complaints over the phone. All complaints and enquiries should be directed to point of sale, (where you purchased the ticket from). For direct bookings only, all passenger enquiries in regards to No Shows, Passengers who have missed their flights or any other post flight enquiry or complaint must be emailed in writing to customerfeedback@heliexperiences.com . Phone feedback or complaints will be referred to the email address. All customer feedback and complaints emailed will receive a auto responder to our published terms and conditions and a written reply within 72 hrs.\r\n\r\nCANCELLATION BY THE COMPANY: The Company reserves the right to cancel or withdraw or postpone a tour or reservation made by The Passenger in which event the tour or reservation will be postponed to a mutually convenient date and time or at the full discretion of the company a full refund may be offered. This does not apply to any tickets purchased through 3rd party resellers or group buying websites where postponements are only available. The Company shall not be liable for any loss or damage in respect of such cancellation or withdrawal or postponement.\r\n\r\nCHILD / INFANT POLICY: Due to the limited seating capacity of helicopters, all passengers are required to pay the full rack rate. Except, where an infant is under 3 years of age, on Private Flights only one infant may travel free of charge as long as the infant is seated on a parent or guardian's knee. There is one seat belt extension available for this situation.\r\n\r\nLEGAL LIABILITY: The Company shall be exempt from all responsibility or liability in respect of any detention, delays, loss, damage, expense, accident, sickness or injury howsoever and by whomsoever caused and whatever kind occurring of or to The Passenger at any time, howsoever occasioned, sustained or suffered in or during any package journey, trip or tour or in carrying out of any arrangements booked by or through it. The Company shall not be responsible for any misdescription or misleading information notwithstanding from whence it came.\r\n\r\nVARIATION OF PRICE: All prices quoted, including fares and tour costs are those current at the date of publication, but are\r\nsubject to alteration without notice at the absolute discretion of The Company. It is recommended that you check regularly to ensure that the latest amendments, if any, are brought to your attention.\r\n\r\nALTERATION OF CONDITIONS: These conditions cannot be varied or altered or waived by any servant or agent or representative of The Company or by any person providing services or facilities unless contained in writing and signed by a Director of The Company. The Company will not be bound by a representation made or purported to have been made on its behalf unless The Company confirms such representation in writing.\r\n\r\nILLEGAL ACTS: The Company reserves the right to expel The Passenger from the tour without payments of compensation should The Passenger commit any illegal or dangerous act, either prior to or during the tour, or if the Passenger appears likely to endanger the health or safety or to impair the comfort of other passengers or crew. Abusive, insulting language, phone calls and/or emails directed towards any staff members will result in customers forfeiting the right to participate on their confirmed flight. The Company will use its discretion in determining whether any refund is due, the passenger may forfeit their ticket with no compensation.\r\n\r\nLUGGAGE: The Company shall not be responsible or liable for any loss, damage or inconvenience caused in the handling of the Passenger's equipment, property or luggage, including as a result of negligence.\r\n\r\nAGENCY: Ancillary tours, accommodation, some travel and other contracts as required are arranged by The Company as agent for The Passenger and not as principal.\r\n\r\nLIMITATION OF LIABILITY: The Company hereby limits its liability to The Passenger to the maximum extent permissible by law including without limiting the generality of the foregoing the exclusion of any liability whatsoever for consequential loss or damage.\r\n\r\nBAGGAGE ALLOWANCE FOR SCENIC FLIGHTS: Passengers are not allowed to board scenic flights with any hand luggage. This includes handbags, backpacks and other luggage. Sharp Implements, weapons and flammable materials including matches, lighters etc are explicitly banned from carriage. Mobile Phones, Cameras and Videos are allowed, subject to pilots approval. In all cases the company, it’s ground staff and the Pilot in charge reserve the right to refuse carriage if they believe that the passenger is in violation of luggage terms and conditions.\r\n\r\nBAGGAGE ALLOWANCE FOR GENERAL CHARTER: Baggage Allowance is 10kg per person, (carry on style) and must be strictly adhered to for safety reasons. Due to the nature of helicopter aircraft, baggage allowances can be increased where the helicopter has fewer passengers than it's capacity. It is advised that passengers should use soft bags for Luggage, as some models of helicopters are unable to fit rigid suitcases.\r\n\r\nAIRCRAFT: The Company reserves the right to substitute aircraft without notice.\r\n\r\nACCEPTANCE OF TERMS: The Passenger acknowledges having read all the above terms and conditions and agrees to be bound thereby.\r\n\r\nDIETARY REQUIREMENTS: Any special dietary requirements must be made clear to the Company in order for us to provide The Passenger with desired preferences.\r\n\r\nDISABILITIES OR SPECIAL REQUIREMENT: Any physical, mental or emotional disability, or special needs that may require special handling, must be notified by The Passenger in writing when the reservation is made.\r\n\r\nPRIVACY POLICY AND CARDHOLDER INFORMATION: When purchasing your financial details are passed through a secure server using the latest 128-bit SSL (secure sockets layer) encryption technology.128-bit SSL encryption is approximated to take at least one trillion years to break, and is the industry standard. If you have any questions regarding our security policy, please contact our customer support centre at bookings@heliexperiences.com or phone 1300 550 131. Our electronic purchase service requires that cardholders provide contact information (including without limitation: name, address, city, state or province, postal code, country, telephone and email), and financial information (including without limitation: name on credit card, credit card number and expiry date), and ordering information. This information is collected and used to process the transaction and for internal accounting and other procedures. Following a transaction, we may contact cardholders by phone or email for security purposes. Heli Experiences uses an approved third party payment gateway (Eway) and credit card details are not accessible by Heli Experiences. No information sent to Heli Experiences via email or the website inquiry form is used for any other reason than to respond to and maintain a record of the inquiry. This information is not sent to third parties or retained for mailing list purposes, unless a customer opts in to our mailing list. Mailing lists can be unsubscribed by the customer at their discretion. Heli Experiences takes measures to protect and keep information secure. Our Merchants' area, application form and electronic purchase service are secured with SSL encryption.",
		"extras": [{
			"name": "Front Seat Guarantee",
			"description": "Secure the best seat in the helicopter, sit next to the pilot and make the most of your photographic opportunities. Only one seat available per flight.",
			"price": 50,
			"extraPriceType": "ANY",
			"image": {
				"itemUrl": "https://img.rezdy.com/EXTRA_IMAGE/FSG 2 small.jpg",
				"thumbnailUrl": "https://img.rezdy.com/EXTRA_IMAGE/FSG 2 small_tb.jpg"
			}
		}, {
			"name": "Window Seat Guarantee",
			"description": "Secure the Window seat on your flight. Note there is a 4 seater helicopter on this service which does have a middle back seat. Up to 2 window seats available per flight.",
			"price": 20,
			"extraPriceType": "ANY",
			"image": {
				"itemUrl": "https://img.rezdy.com/EXTRA_IMAGE/6DOOstQFL94YGXIDFE6cIVCXUtRVFAGf80zq9Jx0Q3g.png",
				"thumbnailUrl": "https://img.rezdy.com/EXTRA_IMAGE/6DOOstQFL94YGXIDFE6cIVCXUtRVFAGf80zq9Jx0Q3g_tb.png",
				"mediumSizeUrl": "https://img.rezdy.com/EXTRA_IMAGE/6DOOstQFL94YGXIDFE6cIVCXUtRVFAGf80zq9Jx0Q3g_med.png",
				"largeSizeUrl": "https://img.rezdy.com/EXTRA_IMAGE/6DOOstQFL94YGXIDFE6cIVCXUtRVFAGf80zq9Jx0Q3g_lg.png"
			}
		}, {
			"name": "Heli Experiences Cap",
			"description": "Buy the cap the pilots are wearing! Purchase a stylish and comfortable Heli Experiences cap to remind you of the stunning flight. Pickup on completion of you flight.",
			"price": 20,
			"extraPriceType": "ANY",
			"image": {
				"itemUrl": "https://img.rezdy.com/EXTRA_IMAGE/Heli_Exp_Cap_sml.jpg",
				"thumbnailUrl": "https://img.rezdy.com/EXTRA_IMAGE/Heli_Exp_Cap_sml_tb.jpg",
				"mediumSizeUrl": "https://img.rezdy.com/EXTRA_IMAGE/Heli_Exp_Cap_sml_med.jpg",
				"largeSizeUrl": "https://img.rezdy.com/EXTRA_IMAGE/Heli_Exp_Cap_sml_lg.jpg"
			}
		}, {
			"name": "City Hotel Return Transfers Shared",
			"description": "Late model Mercedes van Return Transfers City Hotels to Sydney Airport Heliport. MINIMUM of 2 passengers. Order will be incomplete if booking for only 1 passenger.",
			"price": 50,
			"extraPriceType": "QUANTITY",
			"image": {
				"itemUrl": "https://img.rezdy.com/EXTRA_IMAGE/ac7a86df21114204a6dd24f5eb2e9f51vito.jpg",
				"thumbnailUrl": "https://img.rezdy.com/EXTRA_IMAGE/ac7a86df21114204a6dd24f5eb2e9f51vito_tb.jpg",
				"mediumSizeUrl": "https://img.rezdy.com/EXTRA_IMAGE/ac7a86df21114204a6dd24f5eb2e9f51vito_med.jpg",
				"largeSizeUrl": "https://img.rezdy.com/EXTRA_IMAGE/ac7a86df21114204a6dd24f5eb2e9f51vito_lg.jpg"
			}
		}],
		"bookingFields": [{
			"label": "Email",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Individual passenger weights KG (Maximum 110KG shared flight, 125KG private flight)",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "If this is a Gift, Participant name below should be Gift Recipient",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Mobile",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "First Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Last Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}],
		"latitude": -33.9408232,
		"longitude": 151.19162289999997,
		"confirmMode": "AUTOCONFIRM",
		"confirmModeMinParticipants": 0,
		"agentPaymentType": "PAYOUTS",
		"maxCommissionPercent": 10,
		"commissionIncludesExtras": false,
		"cancellationPolicyDays": 7,
		"minimumNoticeMinutes": 0,
		"durationMinutes": 20,
		"dateUpdated": "2016-11-10T03:27:21Z",
		"locationAddress": {
			"addressLine": "Bondi Helicopters 537 Ross Smith Ave",
			"postCode": "2020",
			"city": "Mascot",
			"state": "NSW",
			"countryCode": "au",
			"latitude": -33.9408232,
			"longitude": 151.19162289999997
		},
		"additionalInformation": "Please Arrive 15 Mins before your flight time.\r\nLocation: Bondi Helicopters, Hangar 537, \r\nRoss Smith Ave, Sydney Airport, Mascot, 2020\r\nPhone:  0488 999 626\r\nEmail: bookings@heliexperiences.com",
		"languages": ["en_au"]
	}, {
		"productType": "ACTIVITY",
		"name": "Sydney Harbour Adventure",
		"shortDescription": "A 50 minute adventure, experiencing all the thrills and spills of the Jet Blast, but with so much more!\r\n\r\nDeparting daily throughout the school holidays at 12pm",
		"description": "<p><b>BOOK ONLINE AND SAVE $15<br></b></p><p>RETAIL PRICE: &nbsp;Adult $95 // &nbsp;Child $65 // Family $275 <br></p><p>ONLINE PRICE: Adult $80 // &nbsp;Child $50 // Family $260 **</p><span><br>For SAME DAY Bookings, please call our office on 1300 887 373. Bookings are subject to availability.<br></span><br>** Prices not valid with any other offer, online bookings only** <br><br>By purchasing tickets, you are agreeing to our Terms and Conditions which can be&nbsp;<a href=\"http://www.thunderjetboat.com.au/termsandconditions\">found here</a>&nbsp; <br><br>Children (5-15) - Minimum height requirement is 120cm<br><br>Family -&nbsp;2 Adults + 2 Children<br><br><p>For those who like things a little more extreme, join us for 50 minutes of adrenalin, action and a real taste of Sydney harbour! With a mix of 270-degree spins, wild fishtails and incredible power brake stops this experience can be wet and wild but loads of fun! The Harbour Jet boat races under the famous Harbour Bridge, past Sydney’s popular icons including the Sydney Opera House, Luna Park and towards Sydney Heads!<br></p><p>By purchasing tickets, you are agreeing to our Terms and Conditions which can be&nbsp;<a href=\"http://www.harbourjet.com.au/termsandconditions\">found here</a></p><br><br><br><br>",
		"productCode": "P5C7VY",
		"internalCode": "HJ50",
		"supplierId": 5528,
		"supplierAlias": "harbourjet",
		"supplierName": "Harbour Jet",
		"timezone": "Australia/Sydney",
		"advertisedPrice": 50,
		"priceOptions": [{
			"id": 100299,
			"price": 80,
			"label": "Adult",
			"seatsUsed": 1
		}, {
			"id": 100297,
			"price": 50,
			"label": "Child",
			"seatsUsed": 1
		}, {
			"id": 100298,
			"price": 260,
			"label": "Family (2 Adults + 2 Children)",
			"seatsUsed": 4
		}],
		"currency": "AUD",
		"unitLabel": "Rider",
		"unitLabelPlural": "Riders",
		"quantityRequired": true,
		"quantityRequiredMin": 1,
		"quantityRequiredMax": 24,
		"images": [{
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/5528/5b7b70ed0dd8430f9db39b57b2b97cdfharbour jet photo 2-2.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/5528/5b7b70ed0dd8430f9db39b57b2b97cdfharbour jet photo 2-2_tb.jpg"
		}],
		"bookingMode": "INVENTORY",
		"charter": false,
		"terms": "",
		"generalTerms": "HARBOUR JET BOOKING TERMS AND CONDITIONS\r\n\r\nAll bookings must be paid in full prior to the booking date.\r\nPassengers aged under 18 years must have an adult sign on their behalf.   \r\nChildren are defined as being under the age of 16.\r\nPassengers who ride with Harbour Jet do so at their own risk and must sign a release of liability/assumption of risk prior to boarding.\r\nPassengers who are pregnant, suffer from back, neck, or heart conditions and/or any other pre-existing medical conditions or injuries must not ride with Harbour Jet. \r\nHarbour Jet has the right to refuse any passenger for any reason.  \r\nAll Harbour Jet passengers must meet the minimum height requirement of 120cm. \r\nHarbour Jet will not be responsible for any personal injuries, equipment loss or damage sustained travelling with Harbour Jet.  \r\nPassengers travel with Harbour jet at their own risk.  \r\nPassengers may get wet, and are strongly advised not to carry any valuables whilst travelling with Harbour Jet.  \r\nHarbour jet takes no responsibility for safety or loss / damage to valuables. \r\nIf passengers run late, ride time will be reduced accordingly.\r\nIf a ride is cancelled Harbour Jet will attempt to reschedule the ride at no cost, or compensatory gift vouchers will be supplied.\r\nHarbour Jet reserves the right to refuse service to those who are believed to be affected by alcohol or drugs and no refund will be provided.  \r\nHarbour Jet has the right to substitute any vessel at any time. Ride may change or be cancelled due to weather conditions. We will operate if it is raining.  \r\nHarbour Jet reserves the right to cancel services due to inclement weather (generally defined as precipitation greater than a drizzle, wind and swell conditions by Harbour Jet).  \r\nHarbour Jet reserves the right to cancel or void your gift certificate if you make a booking and do not show up or show up late. This also applies for same day bookings (i.e. those made on the same day as departure).  \r\nPassengers must be at the wharf 30 minutes prior to scheduled departure.  \r\nHarbour Jet reserves the right to resell the seats after this time and charge the client in full if these seats cannot be resold. \r\nAll tickets (including all types of gift certificates and group booking vouchers) are non-refundable.  \r\nCancellations requested within 2 days prior to booking date are subject to approval and may be transferable if approved.  \r\nCancellations must be made by phone to (02) 9566 1066 and followed by an email to bookings@harbourjet.com\r\nPassengers may be filmed/photographed during the ride.  \r\nHarbour Jet reserves the right to reproduce such films/photos for any purpose whatsoever without notification, compensation or payment. \r\nAll details above are correct and are subject to change without notice.",
		"extras": [],
		"bookingFields": [{
			"label": "Title",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "First Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Last Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Phone",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Email",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}],
		"latitude": -33.868657,
		"longitude": 151.201744,
		"confirmMode": "AUTOCONFIRM",
		"confirmModeMinParticipants": 0,
		"agentPaymentType": "PAYOUTS",
		"maxCommissionPercent": 10,
		"commissionIncludesExtras": false,
		"cancellationPolicyDays": 1,
		"minimumNoticeMinutes": 720,
		"durationMinutes": 50,
		"dateUpdated": "2016-11-16T01:28:24Z",
		"locationAddress": {
			"latitude": -33.868657,
			"longitude": 151.201744
		},
		"additionalInformation": "",
		"languages": ["en_au"]
	}, {
		"productType": "ACTIVITY",
		"name": "Jet Blast",
		"shortDescription": "35 Minutes of Awesome Fun!\r\n\r\nDeparting from the iconic Darling Harbour, experience the thrill of Harbour Jet as it races past some of Sydney's most famous landmarks!\r\n\r\nDeparting daily during school holidays at 11am, 1pm and 2pm.",
		"description": "<p><b>BOOK ONLINE AND SAVE $15<br></b></p><p>RETAIL PRICE: &nbsp;Adult $80 // &nbsp;Child $50 // Family $195 <br></p><p>ONLINE PRICE: Adult $65 // &nbsp;Child $40 // Family $180 **</p><span><br>For SAME DAY Bookings, please call our office on 1300 887 373. Bookings are subject to availability.<br></span><br>** Prices not valid with any other offer, online bookings only** <br><br>By purchasing tickets, you are agreeing to our Terms and Conditions which can be&nbsp;<a href=\"http://www.harbourjet.com.au/termsandconditions\">found here</a><br><br><p>PLEASE NOTE: If using a deal voucher (such as groupon, living social, cudo etc) or similar, please select your code will not work on this page - Go to http://www.harbourjet.com/dealvoucher/<br></p><p>PLEASE NOTE, THE LAYOUT ON A SMART PHONE, MAY BE DIFFICULT TO NAVIGATE DUE TO THE SCREEN CONFIGURATION. WE RECOMMEND USING A LAPTOP, PC OR TABLET TO PURCHASE YOUR TICKETS.<br></p>Children (5-15) - Minimum height requirement is 120cm.<br><br>Family -&nbsp;2 Adults + 2 Children<br><br>Sit back and hang on tight as we open the throttle and release 500 litres of water per second from the jet as we unleash the full power at 75km/h. With a mix of 180-degree spins, wild fishtails and incredible power brake stops this experience can be wet and wild but loads of fun! The Harbour Jet boat races under the famous Harbour Bridge, past Sydney’s popular icons including the Sydney Opera House, Luna Park, Fort Denison and more!<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>",
		"productCode": "PASITX",
		"internalCode": "HJ35",
		"supplierId": 5528,
		"supplierAlias": "harbourjet",
		"supplierName": "Harbour Jet",
		"timezone": "Australia/Sydney",
		"advertisedPrice": 35,
		"priceOptions": [{
			"id": 100288,
			"price": 65,
			"label": "Adult",
			"seatsUsed": 1
		}, {
			"id": 100286,
			"price": 40,
			"label": "Child",
			"seatsUsed": 1
		}, {
			"id": 100287,
			"price": 180,
			"label": "Family (2 Adults + 2 Children)",
			"seatsUsed": 4
		}, {
			"id": 100345,
			"price": 120,
			"label": "Double",
			"seatsUsed": 2
		}],
		"currency": "AUD",
		"unitLabel": "Rider",
		"unitLabelPlural": "Riders",
		"quantityRequired": true,
		"quantityRequiredMin": 1,
		"quantityRequiredMax": 10,
		"images": [{
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/5528/_Y1A5733_0551_done_Small.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/5528/_Y1A5733_0551_done_Small_tb.jpg"
		}],
		"bookingMode": "INVENTORY",
		"charter": false,
		"terms": "",
		"generalTerms": "HARBOUR JET BOOKING TERMS AND CONDITIONS\r\n\r\nAll bookings must be paid in full prior to the booking date.\r\nPassengers aged under 18 years must have an adult sign on their behalf.   \r\nChildren are defined as being under the age of 16.\r\nPassengers who ride with Harbour Jet do so at their own risk and must sign a release of liability/assumption of risk prior to boarding.\r\nPassengers who are pregnant, suffer from back, neck, or heart conditions and/or any other pre-existing medical conditions or injuries must not ride with Harbour Jet. \r\nHarbour Jet has the right to refuse any passenger for any reason.  \r\nAll Harbour Jet passengers must meet the minimum height requirement of 120cm. \r\nHarbour Jet will not be responsible for any personal injuries, equipment loss or damage sustained travelling with Harbour Jet.  \r\nPassengers travel with Harbour jet at their own risk.  \r\nPassengers may get wet, and are strongly advised not to carry any valuables whilst travelling with Harbour Jet.  \r\nHarbour jet takes no responsibility for safety or loss / damage to valuables. \r\nIf passengers run late, ride time will be reduced accordingly.\r\nIf a ride is cancelled Harbour Jet will attempt to reschedule the ride at no cost, or compensatory gift vouchers will be supplied.\r\nHarbour Jet reserves the right to refuse service to those who are believed to be affected by alcohol or drugs and no refund will be provided.  \r\nHarbour Jet has the right to substitute any vessel at any time. Ride may change or be cancelled due to weather conditions. We will operate if it is raining.  \r\nHarbour Jet reserves the right to cancel services due to inclement weather (generally defined as precipitation greater than a drizzle, wind and swell conditions by Harbour Jet).  \r\nHarbour Jet reserves the right to cancel or void your gift certificate if you make a booking and do not show up or show up late. This also applies for same day bookings (i.e. those made on the same day as departure).  \r\nPassengers must be at the wharf 30 minutes prior to scheduled departure.  \r\nHarbour Jet reserves the right to resell the seats after this time and charge the client in full if these seats cannot be resold. \r\nAll tickets (including all types of gift certificates and group booking vouchers) are non-refundable.  \r\nCancellations requested within 2 days prior to booking date are subject to approval and may be transferable if approved.  \r\nCancellations must be made by phone to (02) 9566 1066 and followed by an email to bookings@harbourjet.com\r\nPassengers may be filmed/photographed during the ride.  \r\nHarbour Jet reserves the right to reproduce such films/photos for any purpose whatsoever without notification, compensation or payment. \r\nAll details above are correct and are subject to change without notice.",
		"extras": [],
		"bookingFields": [{
			"label": "Title",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Phone",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Email",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "First Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Last Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}],
		"latitude": -33.868657,
		"longitude": 151.201744,
		"confirmMode": "AUTOCONFIRM",
		"confirmModeMinParticipants": 0,
		"agentPaymentType": "PAYOUTS",
		"maxCommissionPercent": 10,
		"commissionIncludesExtras": false,
		"cancellationPolicyDays": 1,
		"minimumNoticeMinutes": 120,
		"durationMinutes": 35,
		"dateUpdated": "2016-12-05T00:52:55Z",
		"locationAddress": {
			"latitude": -33.868657,
			"longitude": 151.201744
		},
		"additionalInformation": "",
		"languages": ["en_au"]
	}, {
		"productType": "DAYTOUR",
		"name": "Blue Mountains Adventure & Hike",
		"shortDescription": "Barefoot Downunder's Blue Mountains Day Tour is an exciting day out in the beautiful Blue Mountains. Our small-group guided tour is an active day including hiking, sightseeing and cultural experiences all led by experienced and fun guides.",
		"description": "<p>Barefoot Downunder’s&nbsp;<strong>Blue Mountains Adventure &amp; Hike</strong>&nbsp;is not your&nbsp;average bus tour! &nbsp;We take you on an&nbsp;<strong>adventure</strong>&nbsp;in the Blue Mountains&nbsp;<strong>hiking</strong>, sightseeing and&nbsp;<strong>animal watching –&nbsp;</strong>while learning about&nbsp;the Australian Indigenous culture through&nbsp;<strong>dreamtime stories</strong>&nbsp;and hearing the&nbsp;insightful history of the Blue Mountains.</p><p>We are one of the more&nbsp;<strong>active day trips</strong>&nbsp;in the Blue Mountains as we like to get out there and hike down to the bottom of&nbsp;<strong>waterfalls</strong>&nbsp;and back, visit unique&nbsp;<strong>aboriginal rock sights</strong>, see kangaroo’s in the wild and&nbsp;other&nbsp;must-visit&nbsp;sights including the&nbsp;<strong>Three Sisters</strong>&nbsp;and more.</p><p>Our tours are led by&nbsp;<strong>fun, local and experienced adventure guides</strong>&nbsp;who love to share&nbsp;the insightful history of the Blue Mountains (and Sydney) as well as having a laugh and telling a few jokes along the way. Our groups are smaller&nbsp;so&nbsp;we&nbsp;can show you places&nbsp;<strong>off-the-beaten-track</strong>&nbsp;where not many tour groups visit&nbsp;making it a more personalised day out.</p><p>If you are looking for a fun and&nbsp;<strong>active tour</strong>, love the&nbsp;<strong>outdoors and hiking</strong>&nbsp;then&nbsp;this&nbsp;<strong>adventure trip</strong>&nbsp;is for you!</p>",
		"productCode": "P7K001",
		"internalCode": "BLUE ADV",
		"supplierId": 41958,
		"supplierAlias": "barefootdownunder",
		"supplierName": "Barefoot Downunder",
		"timezone": "Australia/Sydney",
		"advertisedPrice": 88,
		"priceOptions": [{
			"id": 260225,
			"price": 88,
			"label": "Quantity",
			"seatsUsed": 1
		}],
		"currency": "AUD",
		"unitLabel": "Participant",
		"unitLabelPlural": "Participants",
		"quantityRequired": true,
		"quantityRequiredMin": 1,
		"quantityRequiredMax": 13,
		"images": [{
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/20161207_154633.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/20161207_154633_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/20161207_154633_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/20161207_154633_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Blue_Mountains.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Blue_Mountains_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Blue_Mountains_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Blue_Mountains_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3698.JPG",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3698_tb.JPG",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3698_med.JPG",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3698_lg.JPG"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3224.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3224_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3224_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3224_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Hike_to_Waterfalls.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Hike_to_Waterfalls_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Hike_to_Waterfalls_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Hike_to_Waterfalls_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Amazing_views.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Amazing_views_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Amazing_views_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Amazing_views_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3774__1_.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3774__1__tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3774__1__med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3774__1__lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Awesome_Guides.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Awesome_Guides_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Awesome_Guides_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Awesome_Guides_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/b51789475b3d4110a0f539e5083daf24IMG_3237.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/b51789475b3d4110a0f539e5083daf24IMG_3237_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/b51789475b3d4110a0f539e5083daf24IMG_3237_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/b51789475b3d4110a0f539e5083daf24IMG_3237_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Wild_Kangaroos.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Wild_Kangaroos_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Wild_Kangaroos_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Wild_Kangaroos_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Wentworth_Falls_copy.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Wentworth_Falls_copy_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Wentworth_Falls_copy_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Wentworth_Falls_copy_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/ADVENTUREBFDU.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/ADVENTUREBFDU_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/ADVENTUREBFDU_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/ADVENTUREBFDU_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_1064.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_1064_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_1064_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_1064_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Screen_Shot_2015_11_14_at_2.02.30_am.png",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Screen_Shot_2015_11_14_at_2.02.30_am_tb.png",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Screen_Shot_2015_11_14_at_2.02.30_am_med.png",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Screen_Shot_2015_11_14_at_2.02.30_am_lg.png"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/a_day_out_with_barefoot.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/a_day_out_with_barefoot_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/a_day_out_with_barefoot_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/a_day_out_with_barefoot_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/hiking.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/hiking_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/hiking_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/hiking_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Amazing_hikes.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Amazing_hikes_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Amazing_hikes_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Amazing_hikes_lg.jpg"
		}],
		"bookingMode": "INVENTORY",
		"charter": false,
		"terms": "",
		"generalTerms": "Barefoot Downunder (BD) Terms and Conditions: Must be at pick-up location 10 minutes prior to pick-up time, cancellations 72 hrs prior incur 100% booking fee, no refunds for late arrivals and missed pickup or no-shows. A $10 admin fee applies for any cancellations made after 72 hours for each booking or for any booking changes thereafter. BD reserves the right to change an itinerary and tour at any time without notice due to weather, safety and at company’s discretion. BD reserves the right to cancel a tour if the minimum number of persons required is not met (6 persons on Blue Mtns, 5 persons Figure 8 Pools) and if such occurs a full refund will be given or alternate date made. At least a medium fitness level is required, if you are late throughout the day and miss the departure time you will need to make your way back to Sydney at your own expense. Minimum age is 15 years and up. Other operator prices may change and vary. Please visit our website for full terms and conditions.",
		"extras": [],
		"bookingFields": [{
			"label": "Email",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Special Requirements",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Mobile",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "First Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Last Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Country",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "How did you hear about us?",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Age",
			"requiredPerParticipant": false,
			"requiredPerBooking": false,
			"listOptions": "1. 15-17 yrs\r\n2. 18-29 yrs\r\n3. 30-39 yrs\r\n4. 40-49 yrs\r\n5. 50+ yrs"
		}, {
			"label": "Pick-up location - please choose from the following list:",
			"requiredPerParticipant": false,
			"requiredPerBooking": false,
			"listOptions": "1. Coogee Beach 6:30am, Coogee Bay Hotel - 212-230 Arden Street, Coogee (Corner of Coogee Bay Road and Arden Street)\r\n2. Bondi Beach 6:45am, Ravesi’s Hotel - 118 Campbell Parade, Bondi (Corner of Hall Street and Campbell Parade)\r\n3. Kings Cross 7:00am, at the Bus Stop in front of the El Alamein Memorial Fountain (the Dandelion Fountain)                                                                                              Macleay St, Kings Cross\r\n4. Circular Quay 7:15am, Sydney Harbour Marriott Hotel - 30 Pitt Street, Sydney\r\n5. Central 7:30am, Sydney Central YHA Hostel - 11 Rawson Place, Haymarket"
		}],
		"latitude": 0,
		"longitude": 0,
		"confirmMode": "AUTOCONFIRM",
		"confirmModeMinParticipants": 0,
		"agentPaymentType": "PAYOUTS",
		"maxCommissionPercent": 15,
		"commissionIncludesExtras": false,
		"cancellationPolicyDays": 7,
		"dateCreated": "2016-03-11T06:33:36Z",
		"minimumNoticeMinutes": 30,
		"durationMinutes": 600,
		"dateUpdated": "2016-12-19T09:38:52Z",
		"locationAddress": {
			"addressLine": "",
			"postCode": "",
			"city": "",
			"state": "",
			"countryCode": "",
			"latitude": 0,
			"longitude": 0
		},
		"additionalInformation": "-Barefoot Downunder PH: 02 9664 8868 | www.barefootdownunder.com.au",
		"languages": ["en_au"]
	}, {
		"productType": "ACTIVITY",
		"name": "Tandem Skydive 14,000ft Shuttle Service",
		"shortDescription": "[With Shuttle Service - Free Transfers] for travellers in Sydney city. Skydive up to 14,000ft no more to pay. Drop into our exclusive skydive departure lounge located at 196 Elizabeth St, Sydney. 350m from Central Railway station.",
		"description": "<p>[With Shuttle Service - Free Transfers Sydney City]&nbsp;This product is for travellers who are in Sydney City and require return transfers from the downtown Sydney City.</p><p>Skydive for travellers Staying in Sydney. Includes easy convenient return transfers from our Sydney City skydive checkin and departure lounge located at 196 Elizabeth St, Sydney. The closest skydive to Sydney only 55min from the city. Amazing views.</p><p>We offer the best service, value skydive and fun if you are looking to do a skydive in Sydney. Up to 14,000ft no more to pay. Sydney's only self contained full service skydiving centre, the closest to Sydney only 55min from the Sydney CBD.</p><p>Being self-contained we are the only Skydive operation where you can actually watch your friends and family every step of the way through their entire Skydive. They will gear up right in front of you, board the aircraft right in front of you and land right in front of you.</p><p>We are open 7 days all year &nbsp;*bookings required. Book online today and get instant confirmation, all you need to do is turn up on the day.</p><p><br></p><div></div><p>Maximum Value</p><div><br><ul><li>Freefall from up to 14,000ft</li><li>Fast Jet engine aircraft with magnificent coastal and blue mountain views and Sydney city skyline</li><li>Video and Photos of your Skydive available</li><li>FREE souvenir 4 Gig USB Flash drive loaded with your skydive video and or photos with every video package purchased</li><li>Book on-line instantly with Visa or Mastercard</li><li>Unbeatable Specials for Groups, Students, Travelers and Backpackers</li><li>Sydney's only fully self contained skydive centre, drive in and skydive in comfort</li><li>Sydney: Air conditioned customer lounge, Coffee Shop, BBQ picnic areas for a great day out</li></ul></div>",
		"productCode": "PKFA8G",
		"internalCode": "SYD- Shuttle",
		"supplierId": 7005,
		"supplierAlias": "sydneyskydivers",
		"supplierName": "Sydney Skydivers",
		"timezone": "Australia/Sydney",
		"advertisedPrice": 249,
		"priceOptions": [{
			"id": 99046,
			"price": 275,
			"label": "Quantity",
			"seatsUsed": 1
		}],
		"currency": "AUD",
		"unitLabel": "Participant",
		"unitLabelPlural": "Participants",
		"quantityRequired": true,
		"quantityRequiredMin": 1,
		"quantityRequiredMax": 30,
		"images": [{
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/7005/sydneyskydivers.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/7005/sydneyskydivers_tb.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/7005/plane.jpeg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/7005/plane_tb.jpeg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/7005/lounge_wb2.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/7005/lounge_wb2_tb.jpg"
		}],
		"bookingMode": "INVENTORY",
		"charter": false,
		"terms": "",
		"generalTerms": "TERMS AND CONDITIONS:\r\n\r\n* Over 95kg additional fees apply, max 110kg\r\n\r\nBy making a booking you agree to the following terms and conditions which are publicly available on our web site or by request.\r\n\r\nAll bookings are given a checkin time only. This is not a jump time. Failure to turn up at the assigned checkin time may result in delays to your jump. You will need to checkin and complete paperwork and briefings prior to your jump so it is important that you arrive and checkin on time.\r\n\r\nBookings are non-refundable however you may change your booking date or checkin time with 24hrs prior notice. Should weather prevent your jump from proceeding all payments remain valid for a period of 12 months from original booking date and you are free to choose an alternative date. There are no refunds due weather unless you paid for booking insurance at the time of the original booking. Booking insurance is only available at the time of booking and may not be added at a later date.\r\n\r\nLess that 24hours prior notice will result in a $25 re booking fee being charged.\r\n\r\nIf you think you may be unable to choose alternative dates or have limited availability or are traveling we strongly advise you choose booking insurance. Booking insurance is $19 per person which must be paid at the time of booking and allows you to receive a full refund. Not including the $19 insurance and not including any merchant fees.\r\n\r\nBooking insurance will protect you should you be unable to jump due to weather and not be able to rebook to another date or transfer your booking to another of our skydive locations. It also covers you for accidents, sickness and breakdowns on the day of your skydive as long as you notify us prior to your checkin time on the day of your jump allowing you to re book to another date or receive a full refund less the pre paid booking insurance fee of $19 per person.\r\n\r\nAt the time of booking all validity of packages, prices and offers must be confirmed by the customer booking the skydive. We reserve the right to refuse expired, invalid or unconfirmed offers or packages.\r\n\r\nTo change your booking we require 24 hours notice. We require a $100 deposit per person prior to the booking date. Deposits are a per person payment payment and may not be used to pay the balance of another persons skydive. Deposits are transferable to another person to pay their deposit and remain valid for 12 months.\r\n\r\nThere are no refunds without booking insurance. Booking insurance does not cover persons, or members of a group, failing to turn up on the day of their booking without giving prior notice.\r\n\r\nCredit Card Payments. A 1.8% credit card surcharge may apply. Where this takes place customers will be advised prior to making payment and given the choice of alternate payment methods. In extraordinary circumstances where a refund does take place without booking insurance a $40 administrational fee per person will be charged.\r\n\r\nSafety is a large consideration when skydiving, factors such as wind, cloud, rain, and other factors such as air traffic can affect the time it takes to complete your skydive activity. Weather can change for better or worse in minutes. Whilst we endeavor to complete an individual’s jump within 2-3 hours of arrival, we advise you to arrive with no time constraints – you should plan for this to be at least a half- day’s activity.\r\n\r\nAircraft are mechanical and periodically require servicing and maintenance; we reserve the right to change aircraft type without notice. On occasion, these aircraft changes, weather , Air Traffic Control (ATC) and other operational considerations may require us to change our operational altitude without notice.\r\n\r\nAny unplanned Aircraft availability or other unexpected circumstances beyond our control preventing jumps proceeding: Bookings may be changed to any other date within 12 months of the original booking date. Any refund request due to jumps not proceeding and customers being unable to choose alternative dates requires booking insurance.\r\n\r\nMedical conditions or any other considerations that may affect your skydive should be discussed with us prior to your booking. No alcohol / recreational drugs or medication that may affect or impair your judgment are to be taken.\r\n\r\nGift Vouchers are non-refundable but are transferable. Vouchers will expire 12 months after purchase. Failure to checkin on your chosen date and time will render your voucher invalid.\r\n\r\nExtending a Gift Voucher expiry date:\r\n\r\nWe understand that things do pop up, or time can pass you by. If you forget to redeem your voucher there are some options to extend the value of your voucher.\r\n\r\nNot Expired - Extension Required\r\n\r\nIf your voucher hasn't expired, we can extend your voucher for an additional 3 months for an administration fee of $50. An extension can only be made once.\r\n\r\nVoucher Expired - within 30 days of expiry\r\n\r\nIf your voucher has been expired for 30 days or less we can reactivate your voucher for a fee of $50 this will extend your gift voucher for 30 days.\r\n\r\n\r\nVoucher Expired - 31 days or more past expiry\r\n\r\nIf your voucher has been expired for 31 days or more the voucher cannot be extended under any circumstances.\r\n\r\nBooking a Gift Voucher. You need to redeem your Gift Voucher PRIOR to the jump day by calling and letting us know your voucher number, otherwise you will be unable to use the voucher on the day of your jump.\r\n\r\nIf you lose or misplace your voucher you can still redeem the voucher by quoting your voucher number when booking. To physically replace a lost or misplaced voucher is $25 inc express postage.\r\n\r\nYou must safeguard your voucher number; we will honor or redeem any voucher if a valid (unused) voucher number is quoted.\r\n\r\nWeight is an important factor in Aviation and Skydiving. It affects aircraft weight and balance , fuel allowances and climb rates.\r\n\r\nWeight is also an important factor on a Tandem jump. It affects equipment maintenance, your instructors workload and manufacturers limits and specifications on equipment.\r\n\r\nPlease note that MAXIMUM weight for a Tandem skydive is 110kg All passengers over 95kg a surcharge will apply as follows:\r\n\r\n95kg and over $25\r\n100kg and over $50\r\n\r\n* 110kg and over $100\r\n* Any marginal weight over 110kg where we assess the weight to be acceptable.\r\n\r\nMinimum age is 12 years old and all minors must have a legal guardian present on the day of the jump.\r\n\r\nWhilst it is not mandatory to book a video, it is advisable, as on some occasions a late change of mind may result in disappointment.\r\n\r\nAll bookings require a $100 deposit per person paid at the time of booking to secure your checkin time. If due to weather or after your arrival you are unable to complete your skydive your booking remains valid for 12 months from the original booking date and you may select another date. Deposits may not be used to pay the balance of another persons skydive. Deposits are transferable to pay another persons deposit.\r\n\r\nVideo and photo charges:\r\n\r\nIf all footage is unavailable due to camera failure or other unforeseen circumstances you will be offered a second skydive on the same day with camera AT NO CHARGE, or a full refund of your video/photo product payment.",
		"extras": [{
			"name": "Photos Only",
			"description": "Capture all the action and receive up to 150-250 still photos of your skydive. Photos are 5-11 Megapixel each and are great for blowing to large prints. We will provide your photos on a USB flash drive.",
			"price": 99,
			"extraPriceType": "ANY",
			"image": {
				"itemUrl": "https://img.rezdy.com/EXTRA_IMAGE/photo.jpeg",
				"thumbnailUrl": "https://img.rezdy.com/EXTRA_IMAGE/photo_tb.jpeg"
			}
		}, {
			"name": "Video and Photos",
			"description": "Receive the lot. Your Instructor will use an HD Go Pro to capture all the action and highlights of your skydive including boarding the aircraft, inside the aircraft, your exit from the aircraft, freefall and landing. We provide your video on USB flash drive for easy sharing and playing on your computer. Plus receive 150-200 great photos perfect for web and email sharing. Video and Photos provided on USB drive. DVD upgrade available.",
			"price": 129,
			"extraPriceType": "ANY",
			"image": {
				"itemUrl": "https://img.rezdy.com/EXTRA_IMAGE/9a04a20e4f184ce4abb9f1a7e65e793cphoto.jpeg",
				"thumbnailUrl": "https://img.rezdy.com/EXTRA_IMAGE/9a04a20e4f184ce4abb9f1a7e65e793cphoto_tb.jpeg"
			}
		}, {
			"name": "Video Only",
			"description": "Your Instructor will use an HD Go Pro to capture all the action and highlights of your skydive including boarding the aircraft, inside the aircraft, your exit from the aircraft, freefall and landing. We provide your video on USB flash drive for easy sharing and playing on your computer. DVD upgrade available.",
			"price": 120,
			"extraPriceType": "ANY",
			"image": {
				"itemUrl": "https://img.rezdy.com/EXTRA_IMAGE/8c7c4a8ba30d42d08c65c1282b46fd63photo.jpeg",
				"thumbnailUrl": "https://img.rezdy.com/EXTRA_IMAGE/8c7c4a8ba30d42d08c65c1282b46fd63photo_tb.jpeg"
			}
		}, {
			"name": "Booking Insurance",
			"description": "It's all about choice.\r\n\r\nBooking insurance protects you if you need to cancel your skydive due to unforeseen circumstances prior to checkin. If you are travelling or you simply change your plans, car breaks down. If you are unable to re book to another day due to bad weather on the day of your skydive.\r\n\r\nBooking insurance ensures you receive a full refund not including the $19 pp booking insurance charge.\r\n\r\n* Direct bookings only. \r\n* This is a per person booking insurance fee and must be paid at the  time of the original booking.\r\n* Booking insurance not applicable to Gift Vouchers",
			"price": 19,
			"extraPriceType": "ANY",
			"image": {
				"itemUrl": "https://img.rezdy.com/EXTRA_IMAGE/Screen Shot 2015-01-10 at 6.38.40 pm.png",
				"thumbnailUrl": "https://img.rezdy.com/EXTRA_IMAGE/Screen Shot 2015-01-10 at 6.38.40 pm_tb.png"
			}
		}],
		"bookingFields": [{
			"label": "Anyone Over 95kg (209lbs) ?",
			"requiredPerParticipant": false,
			"requiredPerBooking": false,
			"listOptions": "Yes\r\nNo"
		}, {
			"label": "First Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Last Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Phone",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Mobile",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Email",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Pickup Location (Office Use ONLY)",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Invoiced (Office Use Only)",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "By checking this box, you acknowledge that you have read and agree to the <a href=\"https://sydneyskydivers.rezdy.com/terms\" target=\"_blank\">Terms and Conditions</a>.",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Booking Source",
			"requiredPerParticipant": false,
			"requiredPerBooking": false,
			"listOptions": "City Shop - Agent Booking PHONE\r\nCity Shop - Agent Booking EMAIL\r\nCity Shop - Agent Booking CHAT\r\nCity Shop - Direct Phone Booking\r\nCity Shop - Direct walk in over counter\r\nCity Shop - Direct Web Chat Booking\r\n1___________________________________________\r\nCairns Shop - Agent Booking PHONE\r\nCairns Shop - Agent Booking EMAIL\r\nCairns Shop - Agent Booking CHAT\r\nCairns Shop - Direct Phone Booking\r\nCairns Shop - Direct walk in over counter\r\nCairns Shop - Direct Web Chat Booking\r\n2___________________________________________\r\nBankstown - Agent Booking PHONE\r\nBankstown - Agent Booking EMAIL\r\nBankstown - Agent Booking CHAT\r\nBankstown - Direct Phone Booking\r\nBankstown - Direct walk in over counter\r\nBankstown - Direct Web Chat Booking\r\n3___________________________________________\r\nHome Office - Agent Booking PHONE\r\nHome Office - Agent Booking EMAIL\r\nHome Office - Agent Booking CHAT\r\nHome Office - Direct Phone Booking\r\nHome Office - Direct Web Chat Booking"
		}, {
			"label": "Slack Customer Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}],
		"latitude": -33.8797135,
		"longitude": 151.20914059999996,
		"confirmMode": "AUTOCONFIRM",
		"confirmModeMinParticipants": 0,
		"agentPaymentType": "PAYOUTS",
		"maxCommissionPercent": 10,
		"commissionIncludesExtras": false,
		"cancellationPolicyDays": 30,
		"minimumNoticeMinutes": 60,
		"durationMinutes": 240,
		"dateUpdated": "2016-11-17T03:21:27Z",
		"pickupId": 561,
		"locationAddress": {
			"addressLine": "196 Elizabeth St",
			"postCode": "2000",
			"city": "Sydney",
			"state": "NSW",
			"countryCode": "au",
			"latitude": -33.8797135,
			"longitude": 151.20914059999996
		},
		"additionalInformation": "Your Shuttle departs from our skydive checkin and departure lounge located at 196 Elizabeth St, Sydney  which is about 350m from Central Railway Station. Please checkin at the departure lounge at least 15min prior to departure to complete check in and paperwork.\r\n\r\nIf you have selected  to be picked up from Kings Cross or Circular Quay we would ask you to reconsider and checkin at our departure lounge which will assist getting your shuttle away on time. If you are able to amend your pickup to our checkin lounge please give us a call on 1300SKYDIVE (1300 759 348) to let us know. The advantages of our skydive check in lounge allow you to relax in comfort, grab a complimentary fresh ground Coffee, Tea or water while waiting for your shuttle to depart.\r\n\r\nIf not the pickup time from Kings Cross is 07:10  and Circular Quay 07:15. Please ensure you have your mobile phone turn ON in case we need to contact you on the morning of your pickup to advise of weather or delays.\r\n\r\nOur 11am shuttle only departs from our skydive check in lounge at 196 Elizabeth St due to traffic in downtown Sydney.\r\n\r\nTo streamline your check in on the day of your skydive you can give us a call to complete all payments prior to the day of your skydive or drop into our checkin lounge to make payments. \r\n\r\nYou may also pre fill in the following online form to speed up checkin on the day of your skydive:  www.sydneyskydivers.com.au/form\r\n\r\nIf you pre fill in this form please advise check in staff on your arrival that it has already been completed.",
		"languages": ["en_au"]
	}, {
		"productType": "LESSON",
		"name": "Night Photography Workshop",
		"shortDescription": "3 hour workshop held on Sydney's Harbour Foreshore. Spend an exciting evening learning from a working pro photographer as you capture Sydney’s beautiful lights and iconic landmarks.",
		"description": "<p><br></p><p>&nbsp;<strong>This Photography Workshop is held on various Thursday or Friday nights from 6pm to 9pm</strong>&nbsp;<em>(7pm to 10pm during daylight saving)</em><br></p><p><strong><br></strong></p><p><strong>RUN DURING DAYLIGHT SAVING TIME : &nbsp;</strong><strong>7pm to 10pm&nbsp;</strong></p><p><strong>&amp; FOR THE REMAINDER OF THE YEAR : &nbsp;</strong><strong>6pm to 9pm</strong></p><p><strong><br></strong></p><p>As the city lights come on, and the city comes alive, you will learn creative techniques to help you create postcard quality images in this fun, inspirational and eye-opening experience.</p><p>Your&nbsp;night begins with a harbour-side brief and introduction from a working pro photographer. As night falls, a whole new world of subjects come to life as you spend the evening exploring the bright lights of the amazing Sydney Harbour and its surrounds.</p><p>From the moving ferry lights on the harbour, to the neon lights of the central business district, to the moody and character filled streets of The Rocks, the night photography workshop will introduce you to some very simple yet very creative tips and techniques involved in shooting after dark in Sydney.</p><p>Control your camera manually as you learn how to expose for mood, capture light blur trails, zooming and light painting techniques, creative portraits at night and much more.&nbsp;</p><p>Change the way you see things with a night photography workshop as you learn how to find suitable subject matter by thinking outside the square. &nbsp;</p><p>For beginners looking for a fun and exciting introduction to photography&nbsp;or enthusiasts looking to switch to manual or looking to brush up on their technique. The night photography course with Sydney Photographic Workshops is a fun night’s photography for people looking to shoot and experiment with like minded people. &nbsp;All you need is a Digital SLR, Hybrid or Micro camera&nbsp;with full manual controls, a sturdy tripod and lots of memory space. &nbsp;</p><p><b>NOT SUITABLE FOR COMPACT CAMERAS WITHOUT FULL MANUAL CAPABILITY.&nbsp;</b></p><p><b>A TRIPOD IS ESSENTIAL FOR THIS WORKSHOP - Please note - we do NOT loan tripods.</b></p><p><br></p><p><b>Basic overview of some of the topics that may be covered:</b></p><ul><li>Shooting neon signs &amp; fireworks</li><li>Photographing the moon</li><li>Night landscapes</li><li>Night portraits</li><li>Long exposure techniques</li><li>Using movement</li><li>Equipment</li><li>Safety,&nbsp;camera care &amp; security</li><li>Working with available light</li><li>Introduction to manual exposure</li><li>Composition</li><li>Working with abstracts</li><li>Thinking outside the square</li><li>White balance techniques</li><li>Creative light painting techniques</li></ul><p><br></p><p><b>THIS WORKSHOP IS HELD ON LOCATION AROUND THE SYDNEY HARBOUR FORESHORE - MEETING AT THE OPERA HOUSE</b></p><div><p>Suitable for both beginners&nbsp;and amateurs using a Digital SLR, Hybrid or Micro camera with manual capability.</p><p><strong><br></strong></p><p><strong>You will need:</strong></p><ul><li>Your Camera(s)</li><li>A sturdy tripod (this is essential)</li><li>A selection of lenses if you have more than one&nbsp;</li><li>A torch (to be used in exercises)</li><li>Lens Hood if you have one</li><li>Blank formatted memory Card(s) if shooting digital</li><li>Fully charged camera battery and spare if you have one</li><li>Your cameras manual(s)&nbsp;- for referencing those hard to find features&nbsp;</li><li>Dress casual &amp; comfortable with sensible shoes (you may get a little dirty at some locations)</li></ul><p><strong><br></strong></p><p><strong>Note:&nbsp;</strong><em>A tripod is ESSENTIAL for this workshop.</em></p><p><i><br></i></p><p><i>*A final weather check will be conducted with the Bureau of Meteorology on the day of each workshop. &nbsp;This may lead to the workshop being postponed in cases of unfavourable weather reports. &nbsp;The workshop may run in cases of light showers but not in persistent showers or heavy rain. &nbsp;Should we need to postpone you will be notified via text message to the mobile number supplied to us.</i><br></p><div><i><br></i></div><p><i>Images by students and tutors,&nbsp;</i><i>taken during the actual workshop.</i><br></p></div>",
		"productCode": "PVVRF0",
		"internalCode": "",
		"supplierId": 34171,
		"supplierAlias": "sydneyphotographicworkshops",
		"supplierName": "Sydney Photographic Workshops",
		"timezone": "Australia/Sydney",
		"advertisedPrice": 110,
		"priceOptions": [{
			"id": 191871,
			"price": 110,
			"label": "Single",
			"seatsUsed": 1
		}, {
			"id": 300854,
			"price": 220,
			"label": "Double",
			"seatsUsed": 2
		}],
		"currency": "AUD",
		"unitLabel": "Participant",
		"unitLabelPlural": "Participants",
		"quantityRequired": true,
		"quantityRequiredMin": 1,
		"quantityRequiredMax": 10,
		"images": [{
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/opera_house_-_mark_irwin_0.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/opera_house_-_mark_irwin_0_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/opera_house_-_mark_irwin_0_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/opera_house_-_mark_irwin_0_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/8e54ef73829544b8831a4dd5475a8f32Night.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/8e54ef73829544b8831a4dd5475a8f32Night_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/8e54ef73829544b8831a4dd5475a8f32Night_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/8e54ef73829544b8831a4dd5475a8f32Night_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/e6e4564eaafb468a9d050c591eebfb0bsydney_harbour_-_mark_irwin.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/e6e4564eaafb468a9d050c591eebfb0bsydney_harbour_-_mark_irwin_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/e6e4564eaafb468a9d050c591eebfb0bsydney_harbour_-_mark_irwin_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/e6e4564eaafb468a9d050c591eebfb0bsydney_harbour_-_mark_irwin_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/e81c446a5671497e8debae648611d5aaphotography_course_workshop_night-005.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/e81c446a5671497e8debae648611d5aaphotography_course_workshop_night-005_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/e81c446a5671497e8debae648611d5aaphotography_course_workshop_night-005_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/e81c446a5671497e8debae648611d5aaphotography_course_workshop_night-005_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/e2fb5b94bf6e48d9bba21947070c99a3196846_10151231620438036_1340129430_n.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/e2fb5b94bf6e48d9bba21947070c99a3196846_10151231620438036_1340129430_n_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/e2fb5b94bf6e48d9bba21947070c99a3196846_10151231620438036_1340129430_n_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/e2fb5b94bf6e48d9bba21947070c99a3196846_10151231620438036_1340129430_n_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-002.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-002_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-002_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-002_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/293661_10151231621168036_851858486_n.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/293661_10151231621168036_851858486_n_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/293661_10151231621168036_851858486_n_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/293661_10151231621168036_851858486_n_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/272925d5165d4e62b90ff59741a55371sydney_city_-_mark_irwin.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/272925d5165d4e62b90ff59741a55371sydney_city_-_mark_irwin_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/272925d5165d4e62b90ff59741a55371sydney_city_-_mark_irwin_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/272925d5165d4e62b90ff59741a55371sydney_city_-_mark_irwin_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/206064_10151231617013036_412184541_n.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/206064_10151231617013036_412184541_n_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/206064_10151231617013036_412184541_n_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/206064_10151231617013036_412184541_n_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/252123_10151231620588036_1009918590_n.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/252123_10151231620588036_1009918590_n_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/252123_10151231620588036_1009918590_n_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/252123_10151231620588036_1009918590_n_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/538048_10151231616658036_506095705_n.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/538048_10151231616658036_506095705_n_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/538048_10151231616658036_506095705_n_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/538048_10151231616658036_506095705_n_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/d431275133c04604b1865d9b57b49f8aimg_8632.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/d431275133c04604b1865d9b57b49f8aimg_8632_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/d431275133c04604b1865d9b57b49f8aimg_8632_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/d431275133c04604b1865d9b57b49f8aimg_8632_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-006_0.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-006_0_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-006_0_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-006_0_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-003.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-003_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-003_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-003_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/7d93939600c34f759505298c9580936bimg_8600.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/7d93939600c34f759505298c9580936bimg_8600_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/7d93939600c34f759505298c9580936bimg_8600_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/7d93939600c34f759505298c9580936bimg_8600_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/753c4d31f8cb48c5831240a49c17cc88img_8682.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/753c4d31f8cb48c5831240a49c17cc88img_8682_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/753c4d31f8cb48c5831240a49c17cc88img_8682_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/753c4d31f8cb48c5831240a49c17cc88img_8682_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-001.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-001_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-001_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-001_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/img_8678.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/img_8678_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/img_8678_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/img_8678_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-004.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-004_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-004_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/34171/photography_course_workshop_night-004_lg.jpg"
		}],
		"bookingMode": "INVENTORY",
		"charter": false,
		"terms": "",
		"generalTerms": "For the purpose of clarification;  ‘Photography Course’, ‘Photography Workshop’, ‘Photography Private Tuition’ or ‘Special Photography Event’ will be referred to as an ‘experience’ throughout these terms and conditions. Sydney Photographic Workshops and its team members (referred to herein) may be referred to herein as ‘us’, ‘we’, or ‘our’.\r\n\r\n\r\nPayment and Confirmation of booking\r\n\r\nFull payment of fees must be received at the time of booking to confirm your place on your chosen experience date.  Your place is not confirmed until your fee has been received in full.  Once we have received payment, you will emailed with a confirmation letter with all of the experience details.\r\n\r\n\r\nCancellation, Credits and Refund Policy\r\n\r\nShould your experience date be cancelled by us at any time, or need to be re-scheduled due to unsuitable weather, failure to reach minimum numbers, or any event beyond our control, you will be provided the option to re-book into another future scheduled date for the same experience. Only in the event no alternative dates are available for you to select from will you be offered a credit, valid for 1 year, for any of our experiences to the value of the original experience or a full refund will be provided as final resolution should you request. Should you need to cancel an experience with us due to unforeseen circumstances, this must be done by sending us an email as soon as possible.  In this case, the following cancellation fees apply:  * No refunds if you cancel 7 days, or less, before your experience commencement date.  * 50% of fee will be forfeited if cancellation is made between 8 to 14 days, in advance of the experience commencement date.  * Full refunds are offered should we be provided with written notice of cancellation with 14 days notice, or more, prior to experience commencement date.\r\n\r\n\r\nDeferrals and Exchanges\r\n\r\nWhere 7 days notice, or more, prior to the commencement date of your experience is given in writing requesting a deferral, you are welcome to defer to a future date for that experience within a 6 month period from the date of notification.  Should you provide notice of 7 days, or more, we will be happy to exchange your experience to another of equal value.  Should the experience not be of equal value, any balance of the full fee for the new experience is payable.  A credit for the difference will be given if the new experience is of lesser value.\r\n\r\n\r\nGift Vouchers – Conditions of Use\r\n\r\nFixed dollar amount Gift Vouchers can be used towards any experience at Sydney Photographic Workshops. Workshop specific Gift Vouchers can only be used towards that experience. Gift Vouchers are valid for one year from date of purchase. Dollar value Gift Vouchers may be used as part or full payment for any experience. If the experience fee is more than the amount specified on the voucher, any outstanding fee is payable by the voucher holder to achieve the full balance of the experience being booked. Should a Gift Voucher be used for an experience that is less than the value of the Gift Voucher, the recipient will retain the balance to use for a future experience. No cash refund will be offered. Gift vouchers are not redeemable for cash.  Gift Vouchers are non-refundable\r\n\r\n\r\nWorkshop Images\r\n\r\nImages provided to us, taken by you, may and can be used for promotional purposes of Sydney Photographic Workshops. Should you not wish to have your images showcased or used for these purposes, please advise us in writing by email prior to the commencement date of your experience.  Please note that images taken during our fully produced workshops (full 1 day workshops and special events) contain themes and concepts that are the intellectual property of Sydney Photographic Workshops and the Tutor running the workshop or special event.  Please feel free to use your created images from the day in your portfolio or on your social media, as long you give appropriate credit for them being taken at a Sydney Photographic Workshops event.  You may not use any of these images in a photographic competition. You are not to use them commercially (to make money from them). To do so, you would need to have the models written consent, which is not provided for the workshop, as these are training settings and not commercial shoots. We may also take behind the scenes photos and video throughout your experience for marketing purposes.  Should you decide that you would not like to appear in these, please let us know in writing prior to commencement to the experience.\r\n\r\n\r\nLimit of Liability\r\n\r\nSydney Photographic Workshops and all Directors, employees and contractors accept no liability for death, illness, accident or injury or loss or damage to photo equipment or personal belongings during the course of any experience, or in transit to and from. We reserve the right to change our plans due to any conditions we deem necessary to do so, or to cancel any aspect of the experience due to exceptional or unexpected circumstances. Our liability shall be limited to the total value of the experience only. We are not liable for any indirect or consequential loss. By booking and paying for any experience offered by us, participants acknowledge that they are aware of the risks of personal injury and deem themselves physically able of safely taking part in the experience. Further they release all Directors, employees and contractors from all liability for death, injury, illness, accident or loss of personal property or expenses associated with participation in the experience. We will not be held liable for any loss or additional expenses that you may incur, that are not included in the experience provided by us, even in the event of a cancellation, changes or delay by us.\r\n\r\n\r\nYour Agreement to this Contract\r\n\r\nBy booking an experience or purchasing a gift voucher with us, and subsequently making payment of the fee, you agree to accept all of the above terms and conditions. This includes all persons who pertain to making this booking, including those that do so on the behalf of others.",
		"extras": [],
		"bookingFields": [{
			"label": "First Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Last Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Mobile",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Email",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "City",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Country",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "State/County/Region",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "How did you hear about us?",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Subscribe to the newsletter",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "I agree to receive marketing emails",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Camera Make",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Camera Model",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Do you have a tripod?  (ESSENTIAL  - Please note : we do NOT loan tripods)",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}],
		"latitude": -33.856412457441216,
		"longitude": 151.21462481586912,
		"confirmMode": "AUTOCONFIRM",
		"confirmModeMinParticipants": 5,
		"agentPaymentType": "PAYOUTS",
		"maxCommissionPercent": 15,
		"commissionIncludesExtras": false,
		"cancellationPolicyDays": 0,
		"dateCreated": "2015-09-01T05:21:07Z",
		"minimumNoticeMinutes": 60,
		"durationMinutes": 180,
		"dateUpdated": "2016-06-01T04:45:42Z",
		"locationAddress": {
			"addressLine": "Meeting at the Opera House - Sydney Harbour Foreshore",
			"postCode": "2000",
			"city": "Sydney",
			"state": "New South Wales",
			"countryCode": "au",
			"latitude": -33.856412457441216,
			"longitude": 151.21462481586912
		},
		"additionalInformation": "PLEASE ONLY CLICK ON THE CONFIRMATION LINK IMMEDIATELY BELOW THIS TEXT FOR ALL THE COURSE DETAILS IF YOUR ORDER STATUS IS 'CONFIRMED' IN THE SUBJECT LINE.  \r\n\r\nIF YOUR ORDER STATUS IS 'ON HOLD' IN THE SUBJECT LINE, PLEASE WAIT FOR US TO CONTACT YOU SHOULD A PLACE BECOME AVAILABLE -  YOUR PAYMENT HAS NOT YET BEEN DEDUCTED IF YOU ARE 'ON HOLD'.",
		"languages": ["en_au"]
	}, {
		"productType": "DAYTOUR",
		"name": "Figure 8 Pools Coastal Adventure & Hike",
		"shortDescription": "If you are looking for an adventure that includes hiking, sightseeing, beaches, spotting wildlife, swimming, beautiful scenery with amazing views and heaps of fun then you will need to book our Figure 8 Pools Coastal Adventure Tour!",
		"description": "<p>Barefoot Downunder takes you out&nbsp;to visit the&nbsp;Figure 8 Rock Pools&nbsp;in the&nbsp;<strong>Worlds 2nd oldest National Park</strong>&nbsp;– the&nbsp;Royal National Park.&nbsp;&nbsp;If you are looking for an adventure that includes&nbsp;<strong>hiking, sightseeing, beaches, wildlife, swimming,</strong>&nbsp;<strong>beautiful scenery</strong>&nbsp;and&nbsp;<strong>amazing views</strong>&nbsp;that is&nbsp;<strong>heaps of fun&nbsp;</strong>then you need to book our&nbsp;<strong>Figure 8 Pools&nbsp;Coastal Adventure tour!</strong>&nbsp;</p><p>Our&nbsp;<strong>Figure 8 Pools trip&nbsp;</strong>takes you out to explore this spectacular area found just 45 minutes&nbsp;South of Sydney and 37 Km (23 miles) and only&nbsp;45 minutes in the&nbsp;<strong>Worlds 2nd oldest National Park.</strong>&nbsp;It is a&nbsp;<strong>must-do</strong>&nbsp;for all young travellers, backpackers and students looking for a day of<strong>&nbsp;fun and&nbsp;adventure</strong>&nbsp;just out of Sydney.</p><p>Head out on a 6km (3.7 mi) return hike in&nbsp;the&nbsp;<strong>Worlds 2nd oldest National Park</strong>&nbsp;along changing terrain with spectacular scenery that includes some steep sections and requires a&nbsp;<em>medium to high level of fitness</em>.</p><p>Walk through&nbsp;<strong>Burning Palms Beach</strong>&nbsp;and see the heritage listed Coastal Shacks before continuing along the coast and&nbsp;across the rocks to reach the&nbsp;<strong>Figure 8</strong>&nbsp;<strong>Pools,&nbsp;</strong>learn about ocean and beach safety from your adventure guide.&nbsp;Spend some time to relax and enjoy the area, grab your #figure8pools instagram photos and have a swim before the hike back up.&nbsp;<br></p><p>Visit&nbsp;<strong>Garie beach</strong>, a beautiful&nbsp;little beach&nbsp;in the Royal National Park that is surrounded by coastal headlands.&nbsp;Here you can enjoy a&nbsp;<strong>picnic lunch</strong><strong>&nbsp;</strong>then it’s&nbsp;off to the&nbsp;next adventure where you can&nbsp;<strong>explore, swim</strong>and<strong>&nbsp;relax</strong>&nbsp;at one of the local lagoons and beaches.</p><p>Enjoy spectacular views of the south coast at Bald HIll Lookout and Stanwell Tops, see the Hang gliders and Para gliders take off the hill!<br></p><p>Jump back in the bus to chill as we pump&nbsp;some good tunes and&nbsp;make our way out of the Royal National Park back to Sydney for our 1 drop off at Central YHA Hostel.</p><p>Everyone gets to enjoy&nbsp;a&nbsp;<strong>FREE drink at the end of the day&nbsp;</strong>at&nbsp;one of the local backpacker bars back in Sydney!</p><p>Check out our new Figure 8 Pools tour video here&nbsp;https://www.youtube.com/watch?v=kS3xrCk2JTs</p><p>*Depending on tide times the activities can be reversed in the day in order to reach the Figure Eight Pools at low tide.</p>",
		"productCode": "P02W2E",
		"internalCode": "8 POOLS",
		"supplierId": 41958,
		"supplierAlias": "barefootdownunder",
		"supplierName": "Barefoot Downunder",
		"timezone": "Australia/Sydney",
		"advertisedPrice": 128,
		"priceOptions": [{
			"id": 321094,
			"price": 128,
			"label": "Quantity",
			"seatsUsed": 1
		}],
		"currency": "AUD",
		"unitLabel": "Participant",
		"unitLabelPlural": "Participants",
		"quantityRequired": true,
		"quantityRequiredMin": 1,
		"quantityRequiredMax": 6,
		"images": [{
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/GOPR0433.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/GOPR0433_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/GOPR0433_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/GOPR0433_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_5131.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_5131_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_5131_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_5131_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/GOPR0436.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/GOPR0436_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/GOPR0436_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/GOPR0436_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3341.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3341_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3341_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3341_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2535_copy.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2535_copy_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2535_copy_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2535_copy_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_5173.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_5173_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_5173_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_5173_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2545_copy.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2545_copy_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2545_copy_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2545_copy_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3454.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3454_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3454_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3454_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Screen_Shot_2016_08_21_at_10.59.28_AM.png",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Screen_Shot_2016_08_21_at_10.59.28_AM_tb.png",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Screen_Shot_2016_08_21_at_10.59.28_AM_med.png",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Screen_Shot_2016_08_21_at_10.59.28_AM_lg.png"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3302.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3302_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3302_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3302_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Screen_Shot_2016_08_20_at_5.17.26_PM.png",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Screen_Shot_2016_08_20_at_5.17.26_PM_tb.png",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Screen_Shot_2016_08_20_at_5.17.26_PM_med.png",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Screen_Shot_2016_08_20_at_5.17.26_PM_lg.png"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3355.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3355_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3355_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3355_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3406.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3406_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3406_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_3406_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Wottamola_Bay.jpeg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Wottamola_Bay_tb.jpeg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Wottamola_Bay_med.jpeg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/Wottamola_Bay_lg.jpeg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2328.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2328_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2328_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2328_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_5167.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_5167_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_5167_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_5167_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/BarefootFun.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/BarefootFun_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/BarefootFun_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/BarefootFun_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/GOPR0431.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/GOPR0431_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/GOPR0431_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/GOPR0431_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2536_copy.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2536_copy_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2536_copy_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2536_copy_lg.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2559_copy.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2559_copy_tb.jpg",
			"mediumSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2559_copy_med.jpg",
			"largeSizeUrl": "https://img.rezdy.com/PRODUCT_IMAGE/41958/IMG_2559_copy_lg.jpg"
		}],
		"bookingMode": "INVENTORY",
		"charter": false,
		"terms": "",
		"generalTerms": "Barefoot Downunder (BD) Terms and Conditions: Must be at pick-up location 10 minutes prior to pick-up time, cancellations 72 hrs prior incur 100% booking fee, no refunds for late arrivals and missed pickup or no-shows. A $10 admin fee applies for any cancellations made after 72 hours for each booking or for any booking changes thereafter. BD reserves the right to change an itinerary and tour at any time without notice due to weather, safety and at company’s discretion. BD reserves the right to cancel a tour if the minimum number of persons required is not met (6 persons on Blue Mtns, 5 persons Figure 8 Pools) and if such occurs a full refund will be given or alternate date made. At least a medium fitness level is required, if you are late throughout the day and miss the departure time you will need to make your way back to Sydney at your own expense. Minimum age is 15 years and up. Other operator prices may change and vary. Please visit our website for full terms and conditions.",
		"extras": [],
		"bookingFields": [{
			"label": "First Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Last Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Email",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Country",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Special Requirements",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "How did you hear about us?",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Mobile",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Phone",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Age",
			"requiredPerParticipant": false,
			"requiredPerBooking": false,
			"listOptions": "1. 15-17 yrs\r\n2. 18-29 yrs\r\n3. 30-39 yrs\r\n4. 40-49 yrs\r\n5. 50+ yrs"
		}, {
			"label": "Pick-up location - please choose from the following list:",
			"requiredPerParticipant": false,
			"requiredPerBooking": false,
			"listOptions": "1. Coogee Beach 6:30am, Coogee Bay Hotel - 212-230 Arden Street, Coogee (Corner of Coogee Bay Road and Arden Street)\r\n2. Bondi Beach 6:45am, Ravesi’s Hotel - 118 Campbell Parade, Bondi (Corner of Hall Street and Campbell Parade)\r\n3. Kings Cross 7:00am, at the Bus Stop in front of the El Alamein Memorial Fountain (the Dandelion Fountain)                                                                                              Macleay St, Kings Cross\r\n4. Circular Quay 7:15am, Sydney Harbour Marriott Hotel - 30 Pitt Street, Sydney\r\n5. Central 7:30am, Sydney Central YHA Hostel - 11 Rawson Place, Haymarket"
		}],
		"latitude": -34.0751136,
		"longitude": 151.05581269999993,
		"confirmMode": "AUTOCONFIRM",
		"confirmModeMinParticipants": 0,
		"agentPaymentType": "PAYOUTS",
		"maxCommissionPercent": 15,
		"commissionIncludesExtras": false,
		"cancellationPolicyDays": 7,
		"dateCreated": "2016-07-19T05:04:17Z",
		"minimumNoticeMinutes": 30,
		"durationMinutes": 540,
		"dateUpdated": "2016-12-16T23:40:46Z",
		"locationAddress": {
			"addressLine": "",
			"postCode": "",
			"city": "Royal National Park",
			"state": "NSW",
			"countryCode": "au",
			"latitude": -34.0751136,
			"longitude": 151.05581269999993
		},
		"additionalInformation": "<p><span style=\"text-align: start; color: rgb(43, 60, 78); font-size: 13px;\">It is <b style=\"text-align: start; color: rgb(43, 60, 78); font-size: 13px;\">mandatory for each guest to confirm their booking the day prior by 3pm</b><b> </b>latest by phoning Barefoot Downunder on&nbsp;<b style=\"text-align: start; color: rgb(43, 60, 78); font-size: 13px;\">02 9664 8868</b>.&nbsp;Weather assessments are made each week and before your trip. Please <i>do not make your own assessment</i> as we have to factor in sea conditions such as swell, wave height and periods which can affect the tour and&nbsp;may result in a trip cancellation if unsafe.&nbsp;&nbsp;If a trip is cancelled due to unsafe sea and weather conditions then an alternate date will be offered or a refund will be given.</span></p>",
		"languages": ["en_au"]
	}, {
		"productType": "DAYTOUR",
		"name": "Jenolan Caves, Visit Scenic World, Blue Mountains Day Tour  FJ32",
		"shortDescription": "Jenolan Caves Scenic World Blue Mountains Day Tours\r\n\r\nJenolan Caves with a visit to Scenic World in Blue Mountains",
		"description": "<p><strong>FJ Tours are pleased to announce that we now include a visit to Scenic World on our Jenolan Caves Tour. (Rides at own expense)</strong></p><p>Extend your visit to the Blue Mountains by having a look under them...actually go on a guided tour through the fabulous limestone caverns full of amazing stalagmites. Romantically and dramatically lit by hidden lights these caverns will amaze you with their beauty.<br></p><p>A day tour that takes you directly to the spectacular scenery of the heritage listed Blue Mountains.</p><p><br><strong> Tour Highlights: </strong></p><ul><li>Tour through the magnificent Blue Mountains with it’s beautiful bush landscapes.&nbsp;</li></ul><p></p><ul><li>Opportunity to go on the Scenic Railway, Scenic Cableway and Skyway at Scenic World - FJ Tours take you there (as market leaders we are the first to offer this on our Jenolan Caves Tour, Rides at own expense).</li></ul><p></p><ul><li>Travel to the amazing Jenolan Caves – Australia’s largest and most popular underground limestone cave system where you will enjoy a guided cave inspection.&nbsp;</li></ul><p></p><ul><li>View the spectacular Grand Arch at Jenolan Caves and the unusual Blue Lake.&nbsp;</li></ul><p></p><ul><li>When hunger strikes Trails licensed Bistro provides delicious light meals, snacks and drinks.&nbsp;(lunch at own expense).&nbsp;</li></ul><p></p><ul><li>Have cameras ready for a platypus sighting.&nbsp;</li></ul><p></p><ul><li>Relax as you head to Homebush Bay Wharf to board your river cruise. Enjoy the scenery of the Parramatta River finishing your tour in the heart of Sydney at Circular Quay.</li></ul><p></p><p><strong> BACKPACKERS/STUDENTS and SENIORS</strong> please use the&nbsp;student or senior price at time of booking.</p><p>PLEASE NOTE: Prams and Strollers are not permitted on the Scenic Railway and sections of the scenic walkway are not wheelchair accessible.</p><p>PLEASE CONTACT OUR OFFICE ON 029637 4466&nbsp;THE DAY BEFORE THE TOUR.&nbsp;<br></p><p></p>",
		"productCode": "PBS9JP",
		"internalCode": "FJ32",
		"supplierId": 8371,
		"supplierAlias": "fjtours",
		"supplierName": "FJ Tours",
		"timezone": "Australia/Sydney",
		"advertisedPrice": 135,
		"priceOptions": [{
			"id": 86203,
			"price": 135,
			"label": "Adult",
			"seatsUsed": 1
		}, {
			"id": 86206,
			"price": 70,
			"label": "Child",
			"seatsUsed": 1
		}, {
			"id": 86205,
			"price": 130,
			"label": "Student",
			"seatsUsed": 1
		}, {
			"id": 86204,
			"price": 130,
			"label": "Senior",
			"seatsUsed": 1
		}],
		"currency": "AUD",
		"unitLabel": "Participant",
		"unitLabelPlural": "Participants",
		"quantityRequired": true,
		"quantityRequiredMin": 1,
		"quantityRequiredMax": 24,
		"images": [{
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/8371/00398-0380a (Custom) (2).jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/8371/00398-0380a (Custom) (2)_tb.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/8371/Caves House with new roof tiles2.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/8371/Caves House with new roof tiles2_tb.jpg"
		}, {
			"itemUrl": "https://img.rezdy.com/PRODUCT_IMAGE/8371/Broken Column JC.jpg",
			"thumbnailUrl": "https://img.rezdy.com/PRODUCT_IMAGE/8371/Broken Column JC_tb.jpg"
		}],
		"bookingMode": "INVENTORY",
		"charter": false,
		"terms": "",
		"generalTerms": "FJ Tours Terms and Conditions\r\n\r\nFJ Tours Cancellation Fees:\r\n\r\nA 25% cancellation charge will apply for all bookings. A 50% cancellation charge for cancellation 24 hours prior to the departure time, cancellation within 24 hours prior to commencement of tour or no show on the day will incur 100% cancellation fee, meaning no refund.\r\n\r\nFares, Itineraries: \r\n\r\nPrices shown are Australian Currency and are subject to change without notice. All tour fares are inclusive of GST.\r\n\r\nFJ Tours reserves the right to cancel tours, amend fares, itineraries and days of operation. At times it may be necessary to provide alternative transport or use associated tour operators as required.\r\n\r\nRefunds are not available for wet or changing weather conditions.\r\n\r\nDepartures: \r\n\r\nCoaches depart on time from all attractions. Passengers who miss the coach will be liable for all tours costs back to Sydney. Refunds are not available on the day of travel for partly completed tour.\r\n\r\nImportant: \r\n\r\nFor any tour components not operated by FJ Tours, we cannot and do not take any responsibility for any injury or loss of any type arising in any matter. FJ Tours do not accept responsibility for loss or damage to any property. There will be no refund if you simply change your mind after having booked the tour, realise you can’t afford the tour or were responsible for causing your tour to terminate. FJ Tours shall not be held liable for any damage, expense or inconvenience caused by late arrival of public transport, change of schedule, strikes, vehicle breakdown, Acts of God, or other conditions. \r\n\r\nChildren: \r\n\r\nUnder 3 years old not taking a seat travel Free (Children 3-12 years old) \r\n",
		"extras": [],
		"bookingFields": [{
			"label": "Title",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Email",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "State/County/Region",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Special Requirements",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "First Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Last Name",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Phone",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Mobile",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "City",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Country",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Subscribe to the newsletter",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "How did you hear about us?",
			"requiredPerParticipant": false,
			"requiredPerBooking": false
		}, {
			"label": "Please select your pick up location from the drop down menu (all times are AM - PLEASE NOTE some Hotels have alternative pick up locations):",
			"requiredPerParticipant": false,
			"requiredPerBooking": false,
			"listOptions": "790 George St Backpackers\t 790 George St\t  Pick Up From \tYHA Central  \tPick Up Time:\t7.10\r\nAarons Hotel \t37 Ultimo Rd \tPick Up From \tYHA Central, 11 Rawson Place Pick Up Time:\t7.05\r\nAdge \t212 Riley St Surry Hills Pick up From \t\tCambridge Hotel Pick up Time: \t\t7.25\r\nAdina Apartment Hotel \t511 Kent St     Pick Up from Radisson Suites, 72 Liverpool street  Pick Up Time:    7.05\r\nAdina Central\t2 Lee St, Haymarket \tPick Up From\t YHA Central\t Pick Up Time:\t7.10\r\nAdina Harbourside 55 Shelly St  Pick Up From Travelodge Wynyard, 7 York St Pick Up Time:\t8.05\r\nAmora Hotel Jamison \t11 Jamison St \tPick Up From\tTravelodge Wynyard\tPick Up Time:\t8.05\r\nAstral Towers\t80 Pyrmont St Pyrmont, Pick up from IBIS Darling Harbour, 70 Murray St Pick Up Time: 7:00\r\nBase Hostel\t477 Kent St\tPick Up From\t Pick Up from Radisson Suites, 72 Liverpool street  Pick Up Time:    7.05\r\nBig Hostel\t 212 Elizabeth\t Pick Up From\tVibe Hotel Goulburn St\tPick Up Time:\t7.30\r\nBlue hotel\t6 Cowper Wharf Rd Woolloomooloo  Pick up from SHELL PETROL STATION, opposite Harry Cafe De Wheels \tPick up time:\t7.45\r\nBoulevarde hotel\t90 William St  \tPick Up From\tREAR entrance on Robinson St\tPick Up Time:\t7.35\r\nBounce Hostel\t\tPick Up From\tYHA CENTRAL, 11 Rawson Place, Pick Up Time:\t7.10\r\nBreakFree on George\t653 George st  \tPick Up From YHA CENTRAL, 11 Rawson Place, Pick Up Time:\t7.10\r\nCambridge Hotel\t212 Riley St Surry Hills - Pick Up Time:\t7.25\r\nCapital Square hotel\t730-742 George St Pick Up From YHA CENTRAL, 11 Rawson Place, Pick Up Time:\t7.10\r\nCarrington Apts\t57 York St\tPick Up From\tTravelodge Wynyard Pick Up Time:\t8.05\r\nCastlereagh Boutique Hotel\t169-171 Castlereagh St \tPick Up From\tMetro Hotel, 300 Pitt Street\tPick Up Time:\t7.15\r\nCentral Railway Motel\t240 Chalmers St Redfern \tPick Up From YHA CENTRAL, 11 Rawson Place, Pick Up Time:\t7.10\r\nCentral Station Hotel\t358 Elizabeth St\tPick Up From\tVibe Hotel, 111 Goulburn St\tPick Up Time:\t7.30\r\nDeVere hotel\t44-46 Macleay St, Potts Point\t\t\tPick Up Time:\t7.45\r\nDiamont Hotel\t14 Kings Cross Road \tPick Up From\tHoliday Inn Potts Point\tPick Up Time:\t7.40\r\nFormula 1 Motel\tKings Cross\tPick Up From\tHoliday Inn Potts Point\tPick Up Time:\t7.40\r\nFour Points Sheraton\t161 Sussex St Pick up \t\tPark Royal Darling Harbour \tPick Up Time:\t7.05\r\nFour Seasons hotel\t 199 George st \tPick Up From\t Sydney Harbour Marriott\t Pick Up Time:\t7.55\r\nFraser Suites Hotel\t488 Kent st\tPick Up From\t  Pick Up from Radisson Suites, 72 Liverpool street  Pick Up Time:    7.05\r\nGoldsborough Apartments(Oaks)\t243 Pyrmont \t\t\tPick Up Time:\t7.00\r\nGrace hotel\t77 York St\tPick Up From\tTravelodge Wynyard\tPick Up Time:\t8.05\r\nGrand Mercure Apartments\t50 Murray  St\tPick Up From\tGoldsborough Apartments \tPick Up Time:\t7.00\r\nGreat Southern Hotel\t717 George St  \tPick Up From\tYHA Central\tPick Up Time:\t7.10\r\nHarbour Rocks hotel\t34 Harrington St\tPick Up From\tSydney Harbour Marriott\tPick Up Time:\t7.55\r\nHilton Sydney\t255 Pitt St, 488 George St \tPick Up From\tMetro 300 Pitt Street\tPick Up Time:\t7.15\r\nHoliday Inn Darling Harbour\t68 Harbour St \t\t\tPick Up Time:\t7.05\r\nHoliday Inn Old Sydney\t55 George St     Pick Up Time:\t8.00\r\nHoliday Inn Potts Point\t203 Victoria St\t\t\tPick Up Time:\t7.40\r\nHotel 1888\t139 Murray St Prymont\tPick Up From\tGoldsborough Apartments \tPick Up Time:\t7.00\r\nHotel Stella\t4 Wentworth Ave\tPick Up From VIBE HOTEL, 111 Goulburn St\tPick Up Time:\t7.30\r\nHyde Park Inn\t271 Elizabeth St\tPick Up From\tRydges World Square Pitt St side \tPick Up Time:\t7.15\r\nIbis Darling Harbour\t70 Murray St\tPick Up From\t\tPick Up Time:\t7.00\r\nIbis King Wharf \t22 Shelley St\tPick Up From TRAVELODGE WYNYARD, 7 York St Pick Up Time: 8.05\r\nIbis World Square\t384 Pitt St \tPick Up From\tRydges World Square Pitt St side\tPick Up Time:\t7.15\r\nIntercontinental Hotel (Macquarie St Side)\t117 Macquarie, Bridge & Phillip Sts\t\t\tPick Up Time:\t7.50\r\nLeisure Inn Central\t28 Regent St\tPick Up From\tYHA Central\tPick Up Time:\t7.10\r\nMacleay Apartments\t28 McCleay St\tPick Up From\tDevere Hotel\tPick Up Time:\t7.45\r\nMantra 2 Bond \t2 Bond St &George St\tPick Up From\tTravelodge Wynyard\tPick Up Time:\t8.05\r\nMantra on Kent\t433 Kent St, \tPick Up From\tPark Royal Darling Harbour\tPick Up Time:\t7.05\r\nMaze Bak Pak\t417 Pitt St\tPick Up From\tYHA CENTRAL, 11 Rawson Place, Pick Up Time:\t7.10\r\nMedina Serviced Apt Martin Place\t1 Hosking Place\tPick Up From\tRadisson Blu\tPick Up Time:\t7.50\r\nMenzies\t14 Carrington St, Wynyard\tPick Up From\tTravelodge Wynyard\tPick Up Time:\t8.05\r\nMercure Sydney (Broadway)\t818-820 George St  \tPick Up From\tYHA Central      \tPick Up Time:\t7.10\r\nMeriton Campbell St\t10 Campbell St\tPick Up From YHA Central, 11 Rawson Place, Pick Up Time: 7.10\r\nMeriton Kent St\t528 Kent St cnr 89 Liverpool St\tPick Up From\tRadisson Suites DH (72 Liverpool St)\tPick Up Time:\t7.05\r\nMeriton Pitt St Apts\tCnr 329 Pitt and Bathurst St\tPick Up From\tMetro 300 Pitt Street\tPick Up Time:\t7.15\r\nMeriton Waterloo\t30 Danks St\tPick Up From\tYHA Central\tPick Up Time:\t7.10\r\nMeriton World Tower\t95 Liverpool St, 329 Pitt St\tPick Up From\tRydges World Square Pitt St side\tPick Up Time:\t7.15\r\nMeriton Zetland \t8 Defries Ave\t Pick Up From\t YHA Central\tPick Up Time:\t7.10\r\nMetro Apartments on Darling Harbour\t132-136 Sussex St cnr King\tPick Up From\tPark Royal Darling Harbour\tPick Up Time:\t7.05\r\nMetro Marlow Central Hotel - Pick up from YHA CENTRAL, 11 Rawson Place, Pick Up Time: 7.10\r\nMetro Hotel 300 Pitt St\t300 Pitt St\t\t\tPick Up Time:\t7.15\r\nNapolean on Kent\t219 Kent St  \tPick Up From\tTravelodge Wynyard\tPick Up Time:\t8.05\r\nNovotel Central \t169-179 Thomas St  Pick up from YHA Central, 11 Rawson Place\tPick Up Time:\t7.10\r\nNovotel Darling Harbour\t100 Murray St\tPick Up From\tIbis Darling Harbour\tPick Up Time:\t7.00\r\nNovotel Rockford\t17 Little Pier St\tPick Up From\tHoliday Inn Darling Harbour\tPick Up Time:\t7.05\r\nOakes Castlereagh\t317 Castlereagh St\tPick Up From YHA CENTRAL, 11 Rawson Place, Pick Up Time:\t7.10\r\nOaks Goldsbrough\t243 Pyrmont St, Pick Up Time:\t7.00\r\nOaks Hyde Park Plaza\t38 College St\tPick Up From VIBE HOTEL, 111 Goulburn St\tPick Up Time:\t7.30\r\nPark Regis \t27 Park St  \tPick Up From\tMetro 300 Pitt Street\tPick Up Time:\t7.15\r\nPark Regis Cremorne, pick up from: Travelodge Wynyard, 7 York St, pick up time:\t8.05\r\nPark Royal Darling Harbour 150 Day St  Pick Up Time:\t7.05\r\nPensione Hotel \t631-635 George St\tPick Up From\tYHA Central\tPick Up Time:\t7.10\r\nPullman Hotel\t36 College St      \tPick Up From\tVibe Hotel, 111 Goulburn St, Pick Up Time:\t7.30\r\nQuay Grand hotel\t61 Macquarie St\tPick Up From\tSydney Harbour Marriott, 30 Pitt St\tPick Up Time:\t7.55\r\nQuay West hotel\t98 Glouster St\tPick Up From\tYHA Central, 110 Cumberland St\tPick Up Time:\t8.00\r\nQuest World Square\t2 Cunningham St off Pitt St\tPick Up From\t Rydges World Square Pitt St side \tPick Up Time:\t7.15\r\nRadisson Blu\t cnr 27 O'Connell & Pitt St \t\t\tPick Up Time:\t7.50\r\nRadisson Suites DH\t72 Liverpool St\t\t\tPick Up Time:\t7.05\r\nRendevous Studio Hotel Sydney Central \tCnr Quay and George St\tPick Up From\tYHA Central, 11 Rawson Place Pick Up Time:\t7.10\r\nRendezvous (Stamford) Apts\t75 Harrington St\tPick Up From\tSydney Harbour Marriott, 30 Pitt St\tPick Up Time:\t7.55\r\nRussell hotel\t143a George St The Rocks\tPick Up From\tSydney Harbour Marriott\tPick Up Time:\t7.55\r\nRydges Camperdown\t9 Missenden Rd Camperdown\tPick Up From\tYHA Central\tPick Up Time:\t7.10\r\nRydges World Square\t389 Pitt St cnr Liverpool St\tPick Up From\tPitt St Side of the hotel\tPick Up Time:\t7.15\r\nSeasons Darling Harbour \t38 Harbour St cnr Goulburn St DH\tPick Up From\tHoliday Inn Darling Harbour\tPick Up Time:\t7.05\r\nSeasons Harbour Plaza\t252 Sussex St DH \t\tPark Royal Darling Harbour\tPick Up Time:\t7.05\r\nSebel Pier One hotel\t11 Hickson St\tPick Up Time:\t8.00\r\nShangri La hotel\t176 Cumberland St, Pick up from YHA Harbour 110 Cumberland St Pick Up Time: 8.00\r\nSir Stamford\t93 Macquarie & Albert Sts C Quay\t\t\tPick Up Time:\t7.50\r\nSofitel Wentworth \t61-101 Phillip St Pick up From \t\tRadisson Blu \tPick Up Time:\t7.50\r\nSpringfield Lodge\t9 Springfield Ave\tPick Up From\tHoliday Inn Potts Point\tPick Up Time:\t7.40\r\nSwissbel (York Apt)\t5 York St\tPick Up From\tTravelodge Wynyard, 7 York St\tPick Up Time:\t8.05\r\nSwissotel \t68 Market St Pick up From \t\tRadisson Blu, 27 O'Connell St\tPick Up Time:\t7.50\r\nSydney Central Private hotel\t75 Wentworth St\t Pick Up From\t Vibe Hotel, 111 Goulburn St \tPick Up Time:\t7.30\r\nSydney Harbour Marriott\t 30 Pitt St  Pick Up Time:\t7.55\r\nTravelodge Phillip\t165 Phillip St,  \tPick Up From\tRadisson Blu, 27 O'Connell St\tPick Up Time:\t7.50\r\nTravelodge Wentworth\t27 - 33 Wentworth Ave\tPick Up From\tVibe Hotel, 111 Goulburn St\tPick Up Time:\t7.30\r\nTravelodge Wynyard\t7 York St \t\t\tPick Up Time:\t8.05\r\nVibe Hotel \t111 Goulburn St \t\t\tPick Up Time:\t7.30\r\nVibe Rushcutter Bay\t100 Bayswater Rd\t Pick Up From\t Holiday Inn Potts Point\t Pick Up Time:\t7.40\r\nWake Up\t509 Pitt St\tPick Up From\tYHA Central\tPick Up Time:\t7.10\r\nWaldorf Apts - Chippendale 47-79 Chippendale St, Pick up from YHA CENTRAL, 11 Rawson Place Pick Up Time:\t7.10\r\nWaldorf Apts Darling Harbour\t57 Liverpool St \tPick Up From \tRadisson Suites DH, 72 Liverpool St \tPick Up Time:\t7.05\r\nWaldorf Wooloomooloo \t88 Dowling St, pick up from SHELL PETROL STATION, Opposite Harry Cafe De Wheel Pick Up Time: 7.45\r\nWestin Hotel\tMartin place \tPick Up From\tSydney Harbour Marriott, 30 Pitt St\tPick Up Time:\t7.55\r\nWyndham\t Wentworth st \tPick Up From\tVibe Hotel, 111 Goulburn St\tPick Up Time:\t7.30\r\nY Hotel \t5 Wentworth Ave  Pick up From Vibe Hotel, 111 Goulburn St, Pick Up Time:\t7.30\r\nYHA Central \t11 Rawson Pl \tPick Up Time:\t7.10\r\nYHA Glebe\t262 Glebe Point Rd\tPick Up From\tYHA Central, 11 Rawson Place  \tPick Up Time:\t7.10\r\nYHA Harbour\t110 Cumberland St \tPick Up Time:\t8.00\r\nYHA Railway Square\t\tPick Up From\tYHA Central, 11 Rawson Place\tPick Up Time:\t7.10\r\nYork Apartments 5 York St \tPick Up From\tTravelodge Wynyard, 7 York St \tPick Up Time:\t8.05\r\nZara Tower\t61-65 Wenthworth Ave \tPick Up From\tVibe Hotel, 111 Goulburn St\tPick Up Time:\t7.30"
		}, {
			"label": "How many Children between 3-12 years old?",
			"requiredPerParticipant": false,
			"requiredPerBooking": false,
			"listOptions": "1\r\n2\r\n3\r\n4\r\n5"
		}, {
			"label": "How many Students between 13-18 years old?",
			"requiredPerParticipant": false,
			"requiredPerBooking": false,
			"listOptions": "1\r\n2\r\n3\r\n4\r\n5"
		}, {
			"label": "How did you hear about us?",
			"requiredPerParticipant": false,
			"requiredPerBooking": false,
			"listOptions": "Facebook\r\nInternet Search\r\nPintrest\r\nInstagram\r\nTrip Advisor\r\nTrover\r\nTumblr\r\nFlickr\r\nBlue Mountains Website\r\nJenolan Caves Internet Search\r\nWonderbus \r\nTwitter\r\nBlogger\r\nFoursquare\r\nVine\r\nVK\r\nYou Tube\r\nTour The World Video/TV episode\r\nEat Play Stay Video/TV episode\r\nFriend & Family\r\nBrochure\r\nHotel recommendation\r\nHave traveled with FJ Tours before\r\nYelp\r\nOther (Please advise in Special Requirements section)"
		}],
		"latitude": -33.86181210701533,
		"longitude": 151.21045695767214,
		"confirmMode": "AUTOCONFIRM",
		"confirmModeMinParticipants": 0,
		"agentPaymentType": "PAYOUTS",
		"maxCommissionPercent": 15,
		"commissionIncludesExtras": false,
		"cancellationPolicyDays": 1,
		"minimumNoticeMinutes": 0,
		"durationMinutes": 660,
		"dateUpdated": "2016-11-29T10:20:48Z",
		"locationAddress": {
			"addressLine": "1 Loftus St",
			"postCode": "2000",
			"city": "Circular Quay",
			"state": "NSW",
			"countryCode": "au",
			"latitude": -33.86181210701533,
			"longitude": 151.21045695767214
		},
		"additionalInformation": "",
		"languages": ["en_au"]
	}];



// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  insertDocuments(db, function() {
    db.close();
  });
});

var insertDocuments = function(db, callback) {
  // Get the documents collection
  var collection = db.collection('documents');
  // Insert some documents
  collection.insertMany(products, function(err, result) {
    assert.equal(err, null);
    assert.equal(8, result.result.n);
    assert.equal(8, result.ops.length);
    console.log("Inserted 3 documents into the collection");
    callback(result);
  });
};

