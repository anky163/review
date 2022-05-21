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

  document.querySelector('#mailbox-view').style.display = 'none';

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

    document.querySelector('#mailbox-view').style.display = 'block';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    // Clear old mailbox content
    document.querySelector('#mailbox-view').innerHTML = '';

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
        let alert = document.querySelector('#alert');
        alert.innerHTML = result.error;
        alert.style.display = 'block';
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
  var preposition = 'From: ';
  var person = email.sender;
  if (mailbox === 'sent')
  {
      preposition = 'To: ';
      person = email.recipients;
  }

  element.innerHTML = `
    <div class="preposition"><p>${preposition}</p></div>
    <div class="person-email"><p style="font-weight: bold;">${person}</p></div>
    <div class="email-subject"><p style="font-weight: bold;">${email.subject}</p></div>
    <div class="email-timestamp"><p>${email.timestamp}</p></div>             
  `;

  // When user click on this. email
  element.addEventListener('click', function() {
    console.log('This element has been clicked!');
    email_details(mailbox, email, element)
  });

  document.querySelector('#mailbox-view').append(element);
}




function email_details(mailbox, email, element)
{
  let mailbox_view = document.querySelector('#mailbox-view');
  mailbox_view.innerHTML = '';

  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })

  // Create reply button
  const reply_button = document.createElement('input');
  reply_button.id = 'reply-button'; reply_button.className = 'btn btn-primary'; reply_button.type = 'button'; reply_button.value = 'Reply'; reply_button.style.display = 'none';
  
  if (mailbox !== 'sent')
  {
    reply_button.style.display = 'block';
  }
  reply_button.addEventListener('click', function() {
    console.log('Reply button has been clicked.');
    reply_email(email);
  })

  // Create Archive button
  const archive_button_div = document.createElement('div'); archive_button_div.id = 'archive-button';
  const archive_button = document.createElement('input'); archive_button.type = 'button';  archive_button.value = 'Unarchive'; 
  if (mailbox !== 'sent')
  {   
    if (mailbox === 'inbox')
    {
      archive_button.value = 'Archive';
    }

    // Archive or Unarchive
    archive_button.addEventListener('click', function() {
      //console.log('Archive button has been clicked.');
      archive(email.id, email.archived);
    })
    archive_button_div.append(archive_button)
    mailbox_view.append(archive_button_div);  
  }

  // Email's content
  element.setAttribute("style", "margin: 0; border: none; border-top: 1px gray solid");
  mailbox_view.append(element);

  const email_body = document.createElement('textarea');
  email_body.setAttribute("readonly", ""); email_body.className = "form-control"; email_body.innerHTML = `${email.body}`; 
  mailbox_view.append(email_body);

  mailbox_view.append(reply_button);
}
 



function archive(email_id, email_archived)
{
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
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  document.querySelector('#mailbox-view').style.display = 'none';

  // Hide alert
  document.querySelector('#alert').style.display = 'none';

  const user = document.querySelector('#compose-user').value;

  document.querySelector('#compose-recipients').value = email.sender;

  var begin = 'Re: ';
  var re = true;
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
  const year = d.getFullYear(); const day = d.getDate(); let hour = d.getHours(); let minute = d.getMinutes();
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
  else if (hour < 10)
  {
    hour = `0${hour}`;
  }
  if (minute < 10)
  {
    minute = `0${minute}`;
  }

  const months = ["January","February","March","April","May","June","July","August","September","October", "November","December"];
  const month = months[d.getMonth()];
  
  const timestamp = `${month} ${day} ${year}, ${hour}:${minute} ${meridiem}`;

  document.querySelector('#compose-body').value = `On ${timestamp} ${user} wrote:\n\n`;
  // Sending email
  document.querySelector('#compose-form').onsubmit = send_email;
}