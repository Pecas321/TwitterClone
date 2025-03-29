// document.addEventListener("DOMContentLoaded", async () => {
//     const tweetBtn = document.getElementById("tweetBtn");
//     const logoutBtn = document.getElementById("logoutBtn");

//     async function loadTweets() {
//         try {
//             const response = await fetch("http://localhost:3000/tweets/tweets", {
//                 method: "GET",
//                 credentials: 'include'
//             });
    
//             if (response.ok) {
//                 const tweets = await response.json();
//                 const tweetsContainer = document.getElementById("tweetsContainer");
//                 tweetsContainer.innerHTML = ""; 
    
//                 tweets.forEach(tweet => {
//                     const tweetElement = document.createElement("div");
//                     tweetElement.classList.add("tweet");
//                     tweetElement.setAttribute("data-tweet-id", tweet.id);
                    
//                     const totalLikes = tweet.likes || 0;
    
//                     tweetElement.innerHTML = `
//                         <div class="tw-in">
//                             <p>${tweet.content}</p>
//                             <div class="btns"> 
//                                 <div class="like">
//                                     <button class="likeBtn"><i class="fa-regular fa-heart"></i></button>
//                                     <p class="likeCount">${totalLikes}</p>
//                                 </div>
//                                 <div class="retweet">
//                                     <button class="retweetBtn"><i class="fa-solid fa-retweet"></i></button>
//                                     <p class="retweetCount">0</p>
//                                 </div>
//                                 <button class="commentBtn"><i class="fa-regular fa-comment"></i></button>
//                             </div>
//                             <p class="p-in">Publicado por <span>${tweet.nombre}</span> el ${tweet.fecha_publicacion}</p>
//                         </div>
//                     `;
//                     tweetsContainer.appendChild(tweetElement);
//                 });
    
//                 addEventListenersToButtons();
//             } else {
//                 console.error("Error al cargar los tweets");
//             }
//         } catch (error) {
//             console.error("Error al cargar los tweets:", error);
//         }
//     }
    
    
//     function addEventListenersToButtons() {
//         document.querySelectorAll(".likeBtn").forEach(button => {
//             button.addEventListener("click", async (event) => {
//                 const tweetElement = event.target.closest(".tweet");
//                 const tid = tweetElement.getAttribute("data-tweet-id");
        
//                 try {
//                     const response = await fetch("http://localhost:3000/like", {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({ tid }),
//                         credentials: 'include'
//                     });
        
//                     if (response.ok) {
//                         let likeCountElement = tweetElement.querySelector(".likeCount");
//                         let currentLikes = parseInt(likeCountElement.textContent);
        
//                         if (isNaN(currentLikes)) {
//                             currentLikes = 0;
//                         }
        
//                         likeCountElement.textContent = currentLikes + 1;
//                     } else {
//                         alert("Error al dar Like");
//                     }
//                 } catch (error) {
//                     console.error("Error en Like:", error);
//                     alert("Error en Like");
//                 }
//             });
//         });
        

//         document.querySelectorAll(".retweetBtn").forEach(button => {
//             button.addEventListener("click", async (event) => {
//                 const tweetElement = event.target.closest(".tweet");
//                 const tid = tweetElement.getAttribute("data-tweet-id");
//                 try {
//                     const response = await fetch("http://localhost:3000/retweet", {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({ tid }),
//                         credentials: 'include'
//                     });
//                     if (response.ok) {
//                         let retweetCount = tweetElement.querySelector(".retweetCount");
//                         retweetCount.textContent = parseInt(retweetCount.textContent) + 1;
//                     } else {
//                         alert("Error al dar Retweet");
//                     }
//                 } catch (error) {
//                     console.error("Error en Retweet:", error);
//                     alert("Error en Retweet");
//                 }
//             });
//         });
//     }

//     tweetBtn.addEventListener("click", async () => {
//         const content = document.getElementById("content").value;
//         let fecha = new Date()

//         try {
//             const response = await fetch("http://localhost:3000/tweets/tweet", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ content, fechaPublicacion: fecha }),
//                 credentials: 'include'
//             });

//             if (response.ok) {
//                 alert("Tweet exitoso");
//                 loadTweets();
//             } else {
//                 alert("Error en el tweet");
//             }
//         } catch (error) {
//             alert("Error en el tweet");
//         }
//     });

//     logoutBtn.addEventListener("click", async () => {
//         try {
//             const response = await fetch("http://localhost:3000/logout", {
//                 method: "POST",
//                 credentials: "include", // Incluye las cookies en la solicitud
//             });
    
//             if (response.ok) {
//                 // Redirige al usuario al login
//                 window.location.href = "/";
//             } else {
//                 alert("Error al cerrar sesión");
//             }
//         } catch (error) {
//             console.error("Error al cerrar sesión:", error);
//             alert("Error al cerrar sesión");
//         }
//     });

//     loadTweets();
// });

// const API_BASE_URL = window.location.hostname === 'localhost' 
//     ? 'http://localhost:3000' 
//     : 'http://api-gateway:3000';

// document.addEventListener("DOMContentLoaded", async () => {
//     const tweetBtn = document.getElementById("tweetBtn");
//     const logoutBtn = document.getElementById("logoutBtn");

//     async function loadTweets() {
//         try {
//             const response = await fetch(`${API_BASE_URL}/tweets`, {
//                 method: "GET",
//                 credentials: 'include'
//             });
    
//             if (response.ok) {
//                 const tweets = await response.json();
//                 const tweetsContainer = document.getElementById("tweetsContainer");
//                 tweetsContainer.innerHTML = ""; 
    
//                 tweets.forEach(tweet => {
//                     const tweetElement = document.createElement("div");
//                     tweetElement.classList.add("tweet");
//                     tweetElement.setAttribute("data-tweet-id", tweet.id);
                    
//                     const totalLikes = tweet.likes || 0;
    
//                     tweetElement.innerHTML = `
//                         <div class="tw-in">
//                             <p>${tweet.content}</p>
//                             <div class="btns"> 
//                                 <div class="like">
//                                     <button class="likeBtn"><i class="fa-regular fa-heart"></i></button>
//                                     <p class="likeCount">${totalLikes}</p>
//                                 </div>
//                                 <div class="retweet">
//                                     <button class="retweetBtn"><i class="fa-solid fa-retweet"></i></button>
//                                     <p class="retweetCount">0</p>
//                                 </div>
//                                 <button class="commentBtn"><i class="fa-regular fa-comment"></i></button>
//                             </div>
//                             <p class="p-in">Publicado por <span>${tweet.nombre}</span> el ${tweet.fecha_publicacion}</p>
//                         </div>
//                     `;
//                     tweetsContainer.appendChild(tweetElement);
//                 });
    
//                 addEventListenersToButtons();
//             } else {
//                 console.error("Error al cargar los tweets");
//             }
//         } catch (error) {
//             console.error("Error al cargar los tweets:", error);
//         }
//     }
    
//     function addEventListenersToButtons() {
//         document.querySelectorAll(".likeBtn").forEach(button => {
//             button.addEventListener("click", async (event) => {
//                 const tweetElement = event.target.closest(".tweet");
//                 const tid = tweetElement.getAttribute("data-tweet-id");
//                 try {
//                     const response = await fetch(`${API_BASE_URL}/user/like`, {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({ tid }),
//                         credentials: 'include'
//                     });
        
//                     if (response.ok) {
//                         loadTweets(); // Recargar tweets para ver los cambios
//                     } else {
//                         alert("Error al dar Like");
//                     }
//                 } catch (error) {
//                     console.error("Error en Like:", error);
//                     alert("Error en Like");
//                 }
//             });
//         });
        
//         document.querySelectorAll(".retweetBtn").forEach(button => {
//             button.addEventListener("click", async (event) => {
//                 const tweetElement = event.target.closest(".tweet");
//                 const tid = tweetElement.getAttribute("data-tweet-id");
//                 try {
//                         const response = await fetch(`${API_BASE_URL}/user/retweet`, {
//                         method: "POST",
//                         headers: { "Content-Type": "application/json" },
//                         body: JSON.stringify({ tid }),
//                         credentials: 'include'
//                     });
//                     if (response.ok) {
//                         loadTweets(); // Recargar tweets para ver los cambios
//                     } else {
//                         alert("Error al dar Retweet");
//                     }
//                 } catch (error) {
//                     console.error("Error en Retweet:", error);
//                     alert("Error en Retweet");
//                 }
//             });
//         });
//     }

//     tweetBtn.addEventListener("click", async () => {
//         const content = document.getElementById("content").value;
//         let fecha = new Date();

//         try {
//             const response = await fetch(`${API_BASE_URL}/tweets/tweet`, {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ content, fechaPublicacion: fecha }),
//                 credentials: 'include'
//             });

//             if (response.ok) {
//                 document.getElementById("content").value = "";
//                 loadTweets();
//             } else {
//                 alert("Error en el tweet");
//             }
//         } catch (error) {
//             alert("Error en el tweet");
//         }
//     });

//     logoutBtn.addEventListener("click", async () => {
//         try {
//             const response = await fetch(`${API_BASE_URL}/logout`, {
//                 method: "POST",
//                 credentials: "include",
//             });
    
//             if (response.ok) {
//                 window.location.href = "/login.html";
//             } else {
//                 alert("Error al cerrar sesión");
//             }
//         } catch (error) {
//             console.error("Error al cerrar sesión:", error);
//             alert("Error al cerrar sesión");
//         }
//     });

//     loadTweets();
// });

document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000';
    
    // Función para cargar tweets
    async function loadTweets() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tweets`, {
          method: 'GET',
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to fetch tweets');
        
        const tweets = await response.json();
        renderTweets(tweets);
      } catch (error) {
        console.error('Error loading tweets:', error);
        showError('Error al cargar tweets');
      }
    }
    
    // Función para crear tweet
    async function createTweet(content) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/tweet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getCookie('token')}`
          },
          body: JSON.stringify({ content }),
          credentials: 'include'
        });
        
        if (!response.ok) throw new Error('Failed to create tweet');
        
        loadTweets(); // Recargar tweets después de crear uno nuevo
      } catch (error) {
        console.error('Error creating tweet:', error);
        showError('Error al crear tweet');
      }
    }
    
    // Helper para obtener cookies
    function getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
    }
    
    // Inicialización
    loadTweets();
    
    // Configurar event listeners
    document.getElementById('tweetBtn').addEventListener('click', () => {
      const content = document.getElementById('tweetContent').value;
      if (content) createTweet(content);
    });
  });