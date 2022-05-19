document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox 
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Hide alert
  document.querySelector('#alert').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
 
  // Sending email
  document.querySelector('#compose-form').onsubmit = send_email;
}

function load_mailbox(mailbox) { 
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        // ... do something else with emails ...
        emails.forEach(email => showEmails(mailbox, email));
    });
}


function send_email()
{
  const compose_recipients = document.querySelector('#compose-recipients').value;
  const compose_subject = document.querySelector('#compose-subject').value;
  const compose_body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: `${compose_recipients}`,
        subject: `${compose_subject}`,
        body: `${compose_body}`
    })
  })
  .then(response => response.json())
  .then(result => {
      // Log result to the console
      console.log(result);
      if (result.message)
      {
        load_mailbox('sent');
      }
      else
      {
        document.querySelector('#alert').innerHTML = result.error;
        document.querySelector('#alert').style.display = 'block';
      }
  })
  return false;
}

function showEmails(mailbox, email)
{
  const element = document.createElement('div');
  element.setAttribute("style", "background-color: white");
  element.setAttribute("type", "button");
  if (email.read === true)
  {
    element.setAttribute("style", "background-color: gray");
  }

  element.className = 'content-email';

  let preposition = '<div class="preposition"><p>From: </p></div>';
  let person_email = `<div class="person-email"><p style="font-weight: bold;">${email.sender}</p></div>`;
  let subject = `<div class="email-subject"><p style="font-weight: bold;">${email.subject}</p></div>`;
  let timestamp = `<div class="email-timestamp"><p>${email.timestamp}</p></div>`;

  if (mailbox === 'sent')
  {
    preposition = '<div class="preposition"><p>To: </p></div>';
    person_email = `<div class="person-email"><p style="font-weight: bold;">${email.recipients}</p></div>`;
  }

  element.innerHTML = preposition + person_email + subject + timestamp;

  // When user click on this. email
  element.addEventListener('click', function() {
    console.log('This element has been clicked!');
    click_email(mailbox, email, element)
  });

  // Create a div to contain content
  if (document.querySelector('#mailbox-view') === null)
  {
    let newDiv = document.createElement('div');
    newDiv.id = 'mailbox-view';
    document.querySelector('#emails-view').append(newDiv);
  }
  document.querySelector('#mailbox-view').append(element);
}


function click_email(mailbox, email, element)
{
  eliminate_tag();

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  element.setAttribute("style", "background-coler: gray; margin: 0; border: none; border-top: 1px gray solid");

  const button = document.createElement('div');
  button.id = 'archive-button';

  if (mailbox === 'inbox')
  {
    button.innerHTML = `<input type="button" value="Archive">`;

  }
  if (mailbox === 'archive')
  {
    button.innerHTML = `<input type="button" value="Unarchive">`;   
  }
  // Archive or Unarchive
  button.addEventListener('click', function() {
    //console.log('Archive button has been clicked.');
    email_storage(email.id, email.archived);
  })

  const email_body = document.createElement('textarea');
  email_body.setAttribute("readonly", "");
  email_body.className = "form-control";
  email_body.innerHTML = `${email.body}`;

  // Create reply button
  const reply = document.createElement('div');
  reply.id = 'reply-button';

  if (mailbox !== 'sent')
  {
    reply.innerHTML = `<input class="btn btn-primary" type="button" value="Reply">`;
  }
  reply.addEventListener('click', function() {
    console.log('Reply button has been clicked.');
    reply_email(email);
  })

  // Create a div to contain content
  let newDiv = document.createElement('div');
  newDiv.id = 'mailbox-view';
  document.querySelector('#emails-view').append(newDiv);

  if (mailbox !== 'sent')
  {
    document.querySelector('#mailbox-view').append(button);
  }
  document.querySelector('#mailbox-view').append(element);
  document.querySelector('#mailbox-view').append(email_body);
  if (mailbox !== 'sent')
  {
    document.querySelector('#emails-view').append(reply);
  }

}
 
function email_storage(email_id, email_archived)
{
  //eliminate_tag();
  var boolean = true;
  if (email_archived === true)
  {
    boolean = false;
  }
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
        archived: boolean
    })
  })

  window.location.reload();
  load_mailbox('inbox');
  return false;
}

function reply_email(email)
{
  eliminate_tag();
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

    // Hide alert
    document.querySelector('#alert').style.display = 'none';

  // Clear out composition fields
  const user = document.querySelector('#compose-user').value;
  document.querySelector('#compose-recipients').value = email.sender;

  var begin = 'Re: ';
  re = true;
  for (var i = 0; i < 3; i++)
  {
    if (email.subject[i] !== begin[i])
    {
      re = false;
    }
  }
  document.querySelector('#compose-subject').value = email.subject;
  if (re === false)
  {
    document.querySelector('#compose-subject').value = begin + email.subject;
  }

  // Calculate milliseconds in a year
  const d = new Date();
  const year = d.getFullYear(); const day = d.getDate(); 
  let hour = d.getHours(); let minute = d.getMinutes();
  var meridiem = 'AM';
  if (hour >= 12)
  {
    if (minute > 0)
    {
      meridiem = 'PM';
      if (hour > 12)
      {
        hour -= 12;
      }
    }
  }
  if (hour < 10)
  {
    hour = `0${hour}`;
  }
  if (minute < 10)
  {
    minute = `0${minute}`;
  }

  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const month = months[d.getMonth()];
  
  const timestamp = `${month} ${day} ${year}, ${hour}:${minute} ${meridiem}`;

  document.querySelector('#compose-body').value = `On ${timestamp} ${user} wrote:\n\n`;
  // Sending email
  document.querySelector('#compose-form').onsubmit = send_email;
}

function eliminate_tag()
{
  if (document.querySelector('#mailbox-view') !== null)
  {
    document.querySelector('#mailbox-view').innerHTML = '';
  }
  return false;
}