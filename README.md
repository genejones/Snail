##Physical Newsletters without Stamps
###Using Mandrill, InfraPrint, and Node

Email has long been considered the killer app for computers.
It's what convinced businesses in the 90's to adopt the Internet enmasse.
Email has a standard format with near universal compatibility.
It allows me to communicate near instantly

On the other hand, email is kind of ineffectual.
Loads of people get thousands of email messages daily, most of it crap.
Your message, even if exceptional, is probably going to get lost in the crowd.

Enter junk mail.
Junk mail is horrible.

You know what's worse than junk mail? An empty mailbox.

Mail advantages:

+ Mail *means something.* It's a tangible message.
+ Mail must be physically ignored - even crappy, terrible junk mail is usually opened and skimmed.
+ Mail reaches a broader population. Grandma ain't so good at the Internet.

Mail disadvantages:

+ Cost. 
+ Time. Unless you are a massive company, you'll need to manually mail. By hand. With stamps. Ugh.

Infraprint lets us take Time out of the equation. Mail is just an API call away. No hassle with stamps, envelopes, etc.

To manage our newsletter, we will send a very special email with the Word or PDF we want to send out.

The email goes to a Mandrill inbound rule, which sends a JSON POST request to our Node server.
The node code recieves the PDF and informs Infraprint to mail it out to whoever is in our contact list.

Boom. A physical newsletter, without me touching a single stamp. In less than an hour of code.
Speaking from (painful) experience, it can take more than an hour to mail newsletters at the Post Office.