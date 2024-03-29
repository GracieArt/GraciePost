var sites = {
	// twitter : {
	// 	name : "Twitter",
	// 	useAPI : false,
  //   overrideEmbed : false
	// },
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
		overrideEmbed : false
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

var menuData
var churl
browser.storage.sync.get("churl")
	.then((result) => {
		churl = result.churl || ""
		fetch(churl)
			.then(response => response.json())
			.then(data => {
				menuData = data
				createMenuItems()
			})
	}, onError)


// Create the menu items

function createMenuItems() {
	menuData.forEach(menuLevel => {
		menuLevel.items.forEach(item => {
			browser.menus.create({
				id				: item.id,
				title			: item.title,
				parentId	: item.parentId || undefined,
				contexts	: ["image"]
			})
		})
	})
}

var post

// When a menu item is clicked
browser.menus.onClicked.addListener((info, tab) => {
  console.log("menu clicked")

	// This is the object that gets sent to the bot
	post = {
		imageLink		: info.srcUrl,
		postLink		: info.pageUrl,
		channel 		: info.menuItemId
	}

	// If site is in the sites object, this will contain site-specific options
	site = sites[getSiteName(info.pageUrl)]

	if (!site) {
		// if the site isn't in the sites object, send the post without any special metadata
		// Extract the name of the site from the url
		post.siteName = getSiteName(info.pageUrl)
		postImage(post)
		return
	}


	post.siteName = site.name
	if (site.overrideEmbed) {	// overrides the embed and just posts the link
		postImage({...post, overrideEmbed : true})

	} else if (site.useAPI) { // if we ARE using an api:
		postImageFromApi(site.name, info.pageUrl)

	} else { // if we aren't using the site's api, get metadata from the page
		postImageFromPage()
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
	console.log('sending post')
	console.log(postData)
	postData.key = key
	fetch(sendurl, {
		method:"POST",
		body:JSON.stringify(postData)
	})
	.then(response => console.log(response.text()))
}


async function postImageFromApi(siteName, pageUrl) {
	switch (siteName) {
		case "Furbooru":
			// get post id from url
			let preceedingStr = "images/"
			let start = pageUrl.indexOf(preceedingStr) + preceedingStr.length
			id = pageUrl.substring(start)
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

		case 'Twitter':
			let re = /twitter\.com\/.*\/status(?:es)?\/([^\/\?]+)/
			let matches = pageUrl.match(re)
			if (matches.length === 2) {
				let id = matches[1]
				let url = `https://api.twitter.com/2/tweets/${id}?user.fields=name,profile_image_url`
				// not finished!
			}
		break
	}
}


function postImageFromPage() {
	browser.runtime.onMessage.addListener(handleMessage)
	browser.tabs.executeScript({
		file: "get-post-meta.js"
	})
}
