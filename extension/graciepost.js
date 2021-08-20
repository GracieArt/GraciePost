var sites = {
	twitter : {
		name : "Twitter",
		useAPI : false,
    overrideEmbed : true
	},
  tweetdeck : {
    name : "Twitter",
    useAPI : false,
    overrideEmbed : false
  },
	sofurry : {
		name : "SoFurry",
		useAPI : false,
		overrideEmbed : false
	},
	deviantart : {
		name : "DeviantArt",
		useAPI : false,
		overrideEmbed : false
	},
	furbooru : {
		name : "Furbooru",
		useAPI : true,
		overrideEmbed : true
	},
	furaffinity : {
		name : "Fur Affinity",
		useAPI : false,
		overrideEmbed : false
	},
	pillowfort : {
		name : "Pillowfort",
		useAPI : false,
		overrideEmbed : false
	}
}

let onError = (error) => console.log(`Error: ${error}`)

var key
browser.storage.sync.get("key")
	.then((result) => {
		key = result.key || ""
		//console.log("key: " + key)
	}, onError)

var sendurl
browser.storage.sync.get("sendurl")
	.then((result) => {
		sendurl = result.sendurl || ""
		//console.log("sendurl: " + sendurl)
	}, onError)

var chJSON
var categories
var churl
browser.storage.sync.get("churl")
	.then((result) => {
		churl = result.churl || ""
		fetch(churl)
			.then(response => response.json())
			.then(data => {
				chJSON = data
				categories = chJSON.categories
				//console.log("categories: " + categories)
				createMenuItems()
			})
	}, onError)


// Create the menu items

let createCatMenu = (input) => {
	browser.menus.create({
		id: input.name,
		title: input.name,
		contexts: ["image"]
	})
}

let createChMenu = (input, catID) => {
	browser.menus.create({
		id: input.name,
		parentId: catID,
		title: input.name
	})
}

function createMenuItems() {
	for (const cat in categories) {
		let category = categories[cat]
		createCatMenu(category)

		for (const ch in category.channels) {
			let channel = category.channels[ch]
		 	createChMenu(channel, category.name)
		}
	}
}


// When a menu item is clicked
var post = {}

browser.menus.onClicked.addListener((info, tab) => {
  console.log("saving post")

	// This is the object that gets sent to the bot
	post = {}
	post.imageLink = info.srcUrl
	post.postLink = info.pageUrl
	post.channel = categories[info.parentMenuItemId].channels[info.menuItemId].id

	post.siteName = getSiteName(info.pageUrl) // Extract the name of the site from the url
	site = sites[getSiteName(info.pageUrl)] // If site is in the sites object, this will contain site-specific options

	if (site) {
		post.siteName = site.name

		if (site.overrideEmbed) {	// overrides the embed and just posts the link
			postImage({...post, overrideEmbed : true})

		} else if (site.useAPI) { // if we ARE using an api:
			postImageFromApi(site.name)

		} else { //  if we aren't using the site's api, get metadata from the page
			postImageFromPage()
		}
	} else { // if the site isn't in the sites object, send the post without any metadata
		postImage(post)
	}
})


function handleMessage(message, sender, sendResponse) {
	postImage({
		...post,
		artist : message.artist,
		desc : message.desc,
		//date : message.date,
		title : message.title,
		postLink : message.postLink ?? post.postLink,
		pfp : message.pfp,
	})
}


function getSiteName(url) {
	siteName = (url.includes("https")) ? (url.substring(8)) : (url.substring(7))

	if (siteName.includes("www.")) siteName = siteName.substring(4)
	if (siteName.includes("/"))    siteName = siteName.substring(0, siteName.indexOf("/"))
	if (siteName.includes("."))    siteName = siteName.substring(0, siteName.indexOf("."))

	return siteName
}


function postImage(postData) {
	console.log(postData)
	postData.key = key
	fetch(sendurl, {
		method:"POST",
		body:JSON.stringify(postData)
	})
	.then(response => console.log(response.text()))
}


function postImageFromApi(siteName) {
	switch (siteName) {
		case "Furbooru":
			// get post id from url
			id = info.pageUrl.substring(info.pageUrl.indexOf("images/") + 7)
			id = (id.includes("?")) ? id.substring(0, id.indexOf("?")) : id

			fetch("https://furbooru.org/api/v1/json/images/" + id)
				.then(response => response.json())
				.then(data => {
					fb = data.image

					//get an array of the artists
					artists = []
					for (tag of fb.tags) {
						if (tag.indexOf("artist:") == 0) {
							artists.push(tag.substring(7))
						}
					}

					post.artist = artists.join(", ")
					post.desc = fb.description
					post.origSrc = fb.source_url
					postImage(post)
				})
			break
	}
}


function postImageFromPage() {
	browser.runtime.onMessage.addListener(handleMessage)
	browser.tabs.executeScript({
		file: "get-post-meta.js"
	})
}
