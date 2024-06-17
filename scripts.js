document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();
    const storage = firebase.storage();

    // Function to handle errors
    function handleError(error) {
        let message;
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'This email address is already in use. Please try logging in or use a different email.';
                break;
            case 'auth/invalid-email':
                message = 'The email address is not valid. Please enter a valid email address.';
                break;
            case 'auth/weak-password':
                message = 'The password is too weak. Please enter a stronger password.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password. Please try again.';
                break;
            case 'auth/user-not-found':
                message = 'No user found with this email. Please check the email or sign up.';
                break;
            default:
                message = error.message;
        }
        alert(message);
    }

    // Handle Signup
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log('User signed up:', userCredential.user);
                    window.location.href = 'profile.html'; // Redirect to profile page
                })
                .catch((error) => {
                    console.error('Error signing up:', error);
                    handleError(error); // Display friendly error message
                });
        });
    }

    // Handle Login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    console.log('User logged in:', userCredential.user);
                    window.location.href = 'rankingsetup.html'; // Redirect to ranking setup page
                })
                .catch((error) => {
                    console.error('Error logging in:', error);
                    handleError(error); // Display friendly error message
                });
        });
    }

    // Protect Profile Page
    if (window.location.pathname.endsWith('/profile.html')) {
        auth.onAuthStateChanged((user) => {
            if (!user) {
                window.location.href = 'login.html'; // Redirect to login if not authenticated
            } else {
                // Load user data
                const userId = user.uid;
                db.collection('users').doc(userId).get().then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        document.getElementById('display-name').textContent = userData.name || '';
                        document.getElementById('display-username').textContent = userData.username || '';
                        document.getElementById('display-email').textContent = user.email;
                        document.getElementById('display-bio').textContent = userData.bio || '';
                        if (userData.profilePicture) {
                            document.getElementById('profile-picture').src = userData.profilePicture;
                        }
                        toggleVisibility('display-name', userData.hideName);
                        toggleVisibility('display-username', userData.hideUsername);
                        toggleVisibility('display-email', userData.hideEmail);
                        toggleVisibility('display-bio', userData.hideBio);
                    } else {
                        console.log('No such document!');
                    }
                }).catch((error) => {
                    console.error('Error getting document:', error);
                });
            }
        });
    }

    function toggleVisibility(elementId, hide) {
        const element = document.getElementById(elementId);
        console.log(`${hide ? 'Hiding' : 'Showing'} ${elementId}`);
        if (hide) {
            element.style.display = 'none';
        } else {
            element.style.display = 'block';
        }
    }

    // Handle profile update
    const editProfileForm = document.getElementById('edit-profile-form');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUsername = document.getElementById('new-username').value;
            const newName = document.getElementById('new-name').value;
            const newEmail = document.getElementById('new-email').value;
            const newBio = document.getElementById('new-bio').value;
            const hideName = document.getElementById('hide-name').checked;
            const hideUsername = document.getElementById('hide-username').checked;
            const hideEmail = document.getElementById('hide-email').checked;
            const hideBio = document.getElementById('hide-bio').checked;

            const userId = auth.currentUser.uid;

            db.collection('users').doc(userId).set({
                username: newUsername,
                name: newName,
                email: newEmail,
                bio: newBio,
                hideName: hideName,
                hideUsername: hideUsername,
                hideEmail: hideEmail,
                hideBio: hideBio
            }, { merge: true })
                .then(() => {
                    alert('Profile updated successfully!');
                    document.getElementById('display-username').textContent = newUsername;
                    document.getElementById('display-name').textContent = newName;
                    document.getElementById('display-email').textContent = newEmail;
                    document.getElementById('display-bio').textContent = newBio;
                    toggleVisibility('display-name', hideName);
                    toggleVisibility('display-username', hideUsername);
                    toggleVisibility('display-email', hideEmail);
                    toggleVisibility('display-bio', hideBio);
                    toggleEditProfile(); // Hide the form after saving
                })
                .catch((error) => {
                    console.error('Error updating profile:', error);
                    alert(`Profile update error: ${error.message}`);
                });
        });
    }

    // Handle profile picture update
    const profilePictureForm = document.getElementById('profile-picture-form');
    if (profilePictureForm) {
        profilePictureForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const file = document.getElementById('profile-picture-input').files[0];
            if (file) {
                const userId = auth.currentUser.uid;
                const storageRef = storage.ref();
                const profilePicRef = storageRef.child(`profilePictures/${userId}`);
                profilePicRef.put(file).then(() => {
                    profilePicRef.getDownloadURL().then((url) => {
                        db.collection('users').doc(userId).set({ profilePicture: url }, { merge: true })
                            .then(() => {
                                alert('Profile picture updated successfully!');
                                document.getElementById('profile-picture').src = url;
                            })
                            .catch((error) => {
                                console.error('Error updating profile picture:', error);
                                alert(`Profile picture update error: ${error.message}`);
                            });
                    });
                }).catch((error) => {
                    console.error('Error uploading profile picture:', error);
                    alert(`Profile picture upload error: ${error.message}`);
                });
            }
        });
    }
});

// Ranking Setup Page Protection
if (window.location.pathname.endsWith('/rankingsetup.html')) {
    firebase.auth().onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = 'login.html';
        } else {
            console.log('User is authenticated for ranking setup.');
        }
    });
}

let items = [];

function addItem() {
    const itemInput = document.getElementById('item-input');
    const itemList = document.getElementById('item-list');
    const newItem = itemInput.value.trim();
    if (newItem) {
        items.push(newItem);
        const li = document.createElement('li');
        li.textContent = newItem;
        itemList.appendChild(li);
        itemInput.value = '';
        if (items.length > 1) {
            document.getElementById('start-ranking-button').style.display = 'block';
        }
    }
}

function startRanking() {
    console.log('Start ranking:', items);
}
