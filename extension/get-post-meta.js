url = document.URL


send(
  (url.includes("sofurry.com")) ?
  {
    artist    : document.getElementsByClassName("sf-username")[0].innerText,
    title     : document.getElementById("sfContentTitle").innerHTML,
    desc      : document.getElementById("sfContentBody").firstChild.innerText,
    //date      : new Date(document.getElementsByClassName("sf-userinfo")[0].childNodes[5].data.substring(1)),
    pfp       : document.getElementById("sf-userinfo-outer").children[0].currentSrc
  }
: (url.includes("tweetdeck.twitter")) ?
  {
    artist    : document.getElementById("open-modal").getElementsByClassName("username")[0].innerText,
    //date      : new Date(document.getElementById("open-modal").getElementsByClassName("tweet-timestamp")[0].dateTime),
    desc      : document.getElementById("open-modal").getElementsByClassName("tweet-text")[0].innerText,
    postLink  : document.getElementsByClassName("med-origlink")[0].attributes["href"].value,
    pfp       : document.getElementById("open-modal").getElementsByClassName("tweet-avatar")[0].currentSrc
  }
: (url.includes("deviantart.com")) ?
  {
    title     : document.querySelector("[data-hook='deviation_title']").innerText,
    artist    : document.querySelector("[data-hook='deviation_meta']").getElementsByClassName("user-link")[1].innerText,
    desc      : document.getElementsByClassName("legacy-journal")[0].innerText,
    pfp       : document.querySelector("[data-hook='deviation_meta']").querySelector("[data-hook='user_avatar']").currentSrc.split("?")[0]
  }
: (url.includes("furaffinity.net")) ?
  {
    title     : document.getElementsByClassName("submission-title")[0].innerText,
    artist    : document.getElementsByClassName("submission-id-sub-container")[0].querySelector("a").innerText,
    desc      : document.getElementsByClassName("submission-description")[0].innerText,
    pfp       : document.getElementsByClassName("submission-id-avatar")[0].querySelector("img").currentSrc
  }
: (url.includes("www.pillowfort.social/posts")) ?
  {
    title     : document.getElementsByClassName("title")[0].innerText,
    artist    : document.getElementsByClassName("citation")[0].querySelector("a").innerText,
    desc      : document.getElementsByClassName("content")?.[0]?.innerText,
    pfp       : document.getElementsByClassName("side-info")[0].querySelector("img").currentSrc
  }
: false)


function send(meta) {
  if (meta.desc) {
    if (meta.desc.includes("PostyBirb"))
      meta.desc = meta.desc.substring(0, meta.desc.indexOf("\n\n"))
  }

  browser.runtime.sendMessage(meta)
}
