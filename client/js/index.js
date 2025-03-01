document.addEventListener("DOMContentLoaded", async () => {
    const tweetBtn = document.getElementById("tweetBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    async function loadTweets() {
        try {
            const response = await fetch("http://localhost:3000/tweets", {
                method: "GET",
                credentials: 'include'
            });
    
            if (response.ok) {
                const tweets = await response.json();
                const tweetsContainer = document.getElementById("tweetsContainer");
                tweetsContainer.innerHTML = ""; 
    
                tweets.forEach(tweet => {
                    const tweetElement = document.createElement("div");
                    tweetElement.classList.add("tweet");
                    tweetElement.setAttribute("data-tweet-id", tweet.id);
                    
                    const totalLikes = tweet.likes || 0;
    
                    tweetElement.innerHTML = `
                        <div class="tw-in">
                            <p>${tweet.content}</p>
                            <div class="btns"> 
                                <div class="like">
                                    <button class="likeBtn"><i class="fa-regular fa-heart"></i></button>
                                    <p class="likeCount">${totalLikes}</p>
                                </div>
                                <div class="retweet">
                                    <button class="retweetBtn"><i class="fa-solid fa-retweet"></i></button>
                                    <p class="retweetCount">0</p>
                                </div>
                                <button class="commentBtn"><i class="fa-regular fa-comment"></i></button>
                            </div>
                            <p class="p-in">Publicado por <span>${tweet.nombre}</span> el ${tweet.fecha_publicacion}</p>
                        </div>
                    `;
                    tweetsContainer.appendChild(tweetElement);
                });
    
                addEventListenersToButtons();
            } else {
                console.error("Error al cargar los tweets");
            }
        } catch (error) {
            console.error("Error al cargar los tweets:", error);
        }
    }
    
    
    function addEventListenersToButtons() {
        document.querySelectorAll(".likeBtn").forEach(button => {
            button.addEventListener("click", async (event) => {
                const tweetElement = event.target.closest(".tweet");
                const tid = tweetElement.getAttribute("data-tweet-id");
        
                try {
                    const response = await fetch("http://localhost:3000/like", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tid }),
                        credentials: 'include'
                    });
        
                    if (response.ok) {
                        let likeCountElement = tweetElement.querySelector(".likeCount");
                        let currentLikes = parseInt(likeCountElement.textContent);
        
                        if (isNaN(currentLikes)) {
                            currentLikes = 0;
                        }
        
                        likeCountElement.textContent = currentLikes + 1;
                    } else {
                        alert("Error al dar Like");
                    }
                } catch (error) {
                    console.error("Error en Like:", error);
                    alert("Error en Like");
                }
            });
        });
        

        document.querySelectorAll(".retweetBtn").forEach(button => {
            button.addEventListener("click", async (event) => {
                const tweetElement = event.target.closest(".tweet");
                const tid = tweetElement.getAttribute("data-tweet-id");
                try {
                    const response = await fetch("http://localhost:3000/retweet", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ tid }),
                        credentials: 'include'
                    });
                    if (response.ok) {
                        let retweetCount = tweetElement.querySelector(".retweetCount");
                        retweetCount.textContent = parseInt(retweetCount.textContent) + 1;
                    } else {
                        alert("Error al dar Retweet");
                    }
                } catch (error) {
                    console.error("Error en Retweet:", error);
                    alert("Error en Retweet");
                }
            });
        });
    }

    tweetBtn.addEventListener("click", async () => {
        const content = document.getElementById("content").value;
        let fecha = new Date()

        try {
            const response = await fetch("http://localhost:3000/tweet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content, fechaPublicacion: fecha }),
                credentials: 'include'
            });

            if (response.ok) {
                alert("Tweet exitoso");
                loadTweets();
            } else {
                alert("Error en el tweet");
            }
        } catch (error) {
            alert("Error en el tweet");
        }
    });

    logoutBtn.addEventListener("click", async () => {
        try {
            const response = await fetch("http://localhost:3000/logout", {
                method: "POST",
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = "/login.html";
            } else {
                alert("Error al cerrar sesión");
            }
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
            alert("Error al cerrar sesión");
        }
    });

    loadTweets();
});
