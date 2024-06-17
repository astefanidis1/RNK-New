document.addEventListener('DOMContentLoaded', () => {
    const auth = firebase.auth();
    const db = firebase.firestore();

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
                    window.location.href = 'profile.html'; // Redirect to profile page
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
                        document.getElementById('username').textContent = doc.data().username || user.email;
                    } else {
                        // If no username is set, use email
                        document.getElementById('username').textContent = user.email;
                    }
                });

                // Handle profile update
                const editProfileForm = document.getElementById('edit-profile-form');
                if (editProfileForm) {
                    editProfileForm.addEventListener('submit', (e) => {
                        e.preventDefault();
                        const newUsername = document.getElementById('new-username').value;
                        db.collection('users').doc(userId).set({ username: newUsername }, { merge: true })
                            .then(() => {
                                alert('Username updated successfully!');
                                document.getElementById('username').textContent = newUsername;
                                toggleEditProfile(); // Hide the form after saving
                            })
                            .catch((error) => {
                                console.error('Error updating profile:', error);
                                alert(`Profile update error: ${error.message}`);
                            });
                    });
                }
            }
        });
    }
});
