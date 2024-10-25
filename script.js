// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRrCm3ib899cp2OaZWVJPvFV4Ymf_oC3k",
  authDomain: "whs-sports-clubs.firebaseapp.com",
  projectId: "whs-sports-clubs",
  storageBucket: "whs-sports-clubs.appspot.com",
  messagingSenderId: "121206171678",
  appId: "1:121206171678:web:39045fb98eabc68c82e60f"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);
const db = getFirestore(firebase);
const auth = getAuth(firebase);

// Move isLoggedIn declaration to the top
let isLoggedIn = false;

// Login functionality
document.getElementById('login-btn').addEventListener('click', async () => {
  const email = document.getElementById('username').value; // Use email input as username
  const password = document.getElementById('password').value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    // Successful login
    isLoggedIn = true; // Set to true on successful login
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('notice-form').style.display = 'block';
    displayNotices();  // Display notices after login
  } catch (error) {
    document.getElementById('login-message').textContent = 'Invalid credentials';
    console.error('Error logging in: ', error);
  }
});

// Function to convert time to 12-hour format with AM/PM
function convertTimeTo12Hour(time) {
  const [hours, minutes] = time.split(':');
  let hour = parseInt(hours);
  let period = 'AM';

  if (hour >= 12) {
    period = 'PM';
    if (hour > 12) {
      hour -= 12;
    }
  } else if (hour === 0) {
    hour = 12; // Midnight case
  }

  return `${hour}:${minutes} ${period}`;
}

// Function to post a new notice to Firestore
document.getElementById('addNoticeForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent form submission

    const sport = document.getElementById('sport').value;
    const category = document.getElementById('category').value;
    const team = document.getElementById('team').value;
    const time = document.getElementById('time').value;
    const date = document.getElementById('date').value; // Get date value
    const location = document.getElementById('location').value;
    const notes = document.getElementById('notes').value; // Get notes value

    if (!sport || !category || !team || !time || !date || !location) {
        alert('Please fill in all fields.');
        return;
    }

    const notice = { sport, category, team, time, date, location, notes }; // Include date and notes

    try {
        await addDoc(collection(db, 'notices'), notice);
        console.log('Notice added to Firestore');
        displayNotices();
    } catch (error) {
        console.error('Error adding notice: ', error);
    }
});

// Display notices from Firestore
async function displayNotices() {
    const noticesDiv = document.getElementById('notices');
    noticesDiv.innerHTML = ''; // Clear current notices

    try {
        const querySnapshot = await getDocs(collection(db, 'notices'));

        if (querySnapshot.empty) {
            noticesDiv.innerHTML = '<p>No notices available.</p>'; // Show a message if there are no notices
        } else {
            querySnapshot.forEach(doc => {
                const notice = doc.data();
                const formattedTime = convertTimeTo12Hour(notice.time);
                const formattedDate = notice.date; // Display the date

                const noticeDiv = document.createElement('div');
                noticeDiv.classList.add('notice');
                noticeDiv.innerHTML = `
                    <p><strong>Sport:</strong> ${notice.sport}</p>
                    <p><strong>Category:</strong> ${notice.category}</p>
                    <p><strong>Team:</strong> ${notice.team}</p>
                    <p><strong>Time:</strong> ${formattedTime}</p>
                    <p><strong>Date:</strong> ${formattedDate}</p> <!-- Show date -->
                    <p><strong>Location:</strong> ${notice.location}</p>
                    <p><strong>Notes:</strong> ${notice.notes}</p> <!-- Show notes -->
                `;

                if (isLoggedIn) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.textContent = 'Delete';
                    deleteBtn.classList.add('delete-btn');
                    deleteBtn.addEventListener('click', () => deleteNotice(doc.id));
                    noticeDiv.appendChild(deleteBtn);
                }

                noticesDiv.appendChild(noticeDiv);
            });
        }
    } catch (error) {
        console.error('Error fetching notices: ', error);
    }
}

// Delete notice from Firestore
async function deleteNotice(id) {
  try {
    await deleteDoc(doc(db, 'notices', id));
    console.log('Notice deleted');
    displayNotices();
  } catch (error) {
    console.error('Error deleting notice: ', error);
  }
}

// Call displayNotices on page load to show notices even if not logged in
displayNotices();
