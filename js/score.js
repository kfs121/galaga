const $ranking = document.querySelector("#ranking");
const $rankingResetBtn = document.querySelector(".ranking-wrap .reset");


const rankers = [];


class Ranker {
  place;
  name;
  message;
  score;

  constructor(place, name, message, score) {
    this.place = place;
    this.name = name;
    this.message = message;
    this.score = score;
  }

  getLi() {
    const $li = document.createElement("li");
    const $$spans = [];
    for (let i = 0; i < 4; i++) {
      $$spans.push(document.createElement("span"));
      $li.append($$spans[i]);
    }

    this.insertClassAndText($$spans[0], "place", this.place);
    this.insertClassAndText($$spans[1], "name", this.name);
    this.insertClassAndText($$spans[2], "message", this.message);
    this.insertClassAndText($$spans[3], "score", this.score);

    return $li;
  }

  insertClassAndText($el, className, text) {
    $el.classList.add(className);
    $el.textContent = text;
  }
}

// $sendBtn.addEventListener("click", (e) => {
//   e.preventDefault();
  
//   fetch("https://space-war-server.onrender.com/ranking/add", {
//     method:"post",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       name:$resultForm.name.value,
//       message:$resultForm.message.value,
//       score:300
//     })
//   })
//   .then((res)=>{
//     console.log("추가 완료");
//   })
// });

getRankers();



$rankingResetBtn.addEventListener("click",()=>{
  $$rankers = $ranking.querySelectorAll("li");
  for(let i = 1; i< $$rankers.length; i++){
    $$rankers[i].remove();
  }
  getRankers();
})



function getRankers(){
  fetch("https://space-war-server.onrender.com/ranking/10")
  .then((res) => {
    return res.json();
  })
  .then((data) => {
    data.forEach((el, idx) => {
      const ranker = new Ranker(idx + 1, el.name, el.message, el.score);
      rankers.push(ranker);
      $ranking.append(ranker.getLi());
    });
    return data;
  });
}