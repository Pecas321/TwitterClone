document.addEventListener("DOMContentLoaded", initializeApp);

const API_BASE_URL = 'http://localhost:3000';

async function initializeApp() {
    try {
        const tweetBtn = document.getElementById("tweetBtn");
        const logoutBtn = document.getElementById("logoutBtn");
        const tweetContent = document.getElementById("tweetContent");
        const tweetsContainer = document.getElementById("tweetsContainer");

        if (!tweetBtn || !logoutBtn || !tweetContent || !tweetsContainer) {
            throw new Error("Elementos esenciales del DOM no encontrados");
        }

        tweetBtn.addEventListener("click", tweet);
        logoutBtn.addEventListener("click", logout);

        await loadTweets();

    } catch (error) {
        console.error("Error inicializando la aplicación:", error);
        errors("Error al iniciar la aplicación. Por favor recarga la página.");
    }
}

async function tweet() {
    try {
        const tweetContent = document.getElementById("tweetContent").value.trim();
        
        if (!tweetContent) {
            errors("Por favor escribe algo para twittear");
            return;
        }

        const token = cookies("token");
        if (!token) {
            errors("No estás autenticado. Por favor inicia sesión.");
            return;
        }

        const response = await fetch(`http://localhost:3000/tweet`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            credentials: "include",
            body: JSON.stringify({
                content: tweetContent,
                fechaPublicacion: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al publicar tweet");
        }

        document.getElementById("tweetContent").value = "";
        await loadTweets();
        msj("¡Tweet publicado con éxito!");

    } catch (error) {
        console.error("Error al publicar tweet:", error);
        errors(`Error al publicar tweet: ${error.message}`);
    }
}

async function loadTweets() {
    try {
        const response = await fetch(`${API_BASE_URL}/tweets`, {
            method: "GET",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`Error HTTP! estado: ${response.status}`);
        }

        const tweets = await response.json();
        renderTweets(tweets);

    } catch (error) {
        console.error("Error cargando tweets:", error);
        errors("Error al cargar tweets. Intenta nuevamente.");
    }
}

async function renderTweets(tweets) {
    const tweetsContainer = document.getElementById("tweetsContainer");
    if (!tweetsContainer) return;

    const tweetsWithStats = await Promise.all(tweets.map(async tweet => {
      try {
        const response = await fetch(`${API_BASE_URL}/stats/${tweet.tid}`);
        const stats = await response.json();
        return { ...tweet, ...stats };
      } catch (error) {
        return { ...tweet, likes: 0, retweets: 0 };
      }
    }));
  
    tweetsContainer.innerHTML = tweetsWithStats.map(tweet => `
      <div class="tweet" data-tweet-id="${tweet.tid}">
        <div class="tw-in">
          <p>${tweet.content}</p>
          <div class="btns">
            <div class="like">
              <button class="likeBtn"><i class="fa-regular fa-heart"></i></button>
              <p class="likeCount">${tweet.likes || 0}</p>
            </div>
            <div class="retweet">
              <button class="retweetBtn"><i class="fa-solid fa-retweet"></i></button>
              <p class="retweetCount">${tweet.retweets || 0}</p>
            </div>
            <button class="commentBtn"><i class="fa-regular fa-comment"></i></button>
          </div>
          <p class="p-in">Publicado por <span>${tweet.user_name}</span> el ${tweet.publicacion}</p>
        </div>
      </div>
    `).join("");
    
    buttons();
  }

async function logout() {
    try {
        const response = await fetch(`${API_BASE_URL}/logout`, {
            method: "POST",
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error("Error al cerrar sesión");
        }

        window.location.href = "/login.html";

    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        errors("Error al cerrar sesión. Intenta nuevamente.");
    }
}

function cookies(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function errors(message) {
    const errorElement = document.getElementById("error-message") || msjElement("error-message");
    errorElement.textContent = message;
    errorElement.style.display = "block";
    setTimeout(() => errorElement.style.display = "none", 5000);
}

function msj(message) {
    const successElement = document.getElementById("success-message") || msjElement("success-message");
    successElement.textContent = message;
    successElement.style.display = "block";
    setTimeout(() => successElement.style.display = "none", 3000);
}

function msjElement(id) {
    const element = document.createElement("div");
    element.id = id;
    element.style.padding = "10px";
    element.style.margin = "10px 0";
    element.style.borderRadius = "5px";
    element.style.display = "none";
    
    if (id === "error-message") {
        element.style.backgroundColor = "#ffeeee";
        element.style.color = "#ff3333";
        element.style.border = "1px solid #ffcccc";
    } else {
        element.style.backgroundColor = "#eeffee";
        element.style.color = "#33aa33";
        element.style.border = "1px solid #ccffcc";
    }
    
    document.body.prepend(element);
    return element;
}

function buttons() {
    document.querySelectorAll(".likeBtn").forEach(button => {
        button.addEventListener("click", like);
    });
    
    document.querySelectorAll(".retweetBtn").forEach(button => {
        button.addEventListener("click", retweet);
    });
}

async function like(event) {
    try {
      const tweetElement = event.target.closest(".tweet");
      const tweetId = tweetElement.getAttribute("data-tweet-id");
      const token = cookies("token");
      
      if (!token) {
        errors("Debes iniciar sesión para dar like");
        return;
      }
  
      const response = await fetch(`${API_BASE_URL}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ tid: tweetId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al dar like");
      }
      
      const result = await response.json();
      
      tweetElement.querySelector('.likeCount').textContent = result.likes;
      const likeIcon = tweetElement.querySelector('.likeBtn i');
      
      if (result.action === 'liked') {
        likeIcon.classList.replace('fa-regular', 'fa-solid');
        likeIcon.style.color = 'red';
      } else {
        likeIcon.classList.replace('fa-solid', 'fa-regular');
        likeIcon.style.color = '';
      }

      await updateTweets(tweetId);
      await loadTweets(); 
      
    } catch (error) {
      console.error("Error al dar like:", error);
      errors(error.message);
    }
  }

  async function retweet(event) {
    try {
      const tweetElement = event.target.closest(".tweet");
      const tweetId = tweetElement.getAttribute("data-tweet-id");
      
      const response = await fetch(`${API_BASE_URL}/retweet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${cookies("token")}`
        },
        credentials: "include",
        body: JSON.stringify({ tid: tweetId })
      });
      
      if (!response.ok) {
        throw new Error("Error al hacer retweet");
      }
      
      await updateTweets(tweetId);
      await loadTweets(); 
      
    } catch (error) {
      console.error("Error al hacer retweet:", error);
      errors("Error al hacer retweet. Intenta nuevamente.");
    }
  }
  

  async function updateTweets(tweetId) {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/${tweetId}`);
      const stats = await response.json();
      
      const tweetElement = document.querySelector(`.tweet[data-tweet-id="${tweetId}"]`);
      if (tweetElement) {
        tweetElement.querySelector('.likeCount').textContent = stats.likes;
        tweetElement.querySelector('.retweetCount').textContent = stats.retweets;
      }
    } catch (error) {
      console.error("Error actualizando estadísticas:", error);
    }
  }
  
