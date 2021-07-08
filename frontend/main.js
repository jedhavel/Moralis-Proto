// JavaScript source code
Moralis.initialize("7KtGF1RaVgP8Xzp3X2KzTflt5oHe6daLkUilqveC");
Moralis.serverURL = 'https://xhasibdooyzm.moralis.io:2053/server'

init = async () => {
    hideElement(userInfo);
    hideElement(createItemForm);
    window.web3 = await Moralis.Web3.enable();
    initUser();
}

initUser = async () => {
    if (await Moralis.User.current()) {
        hideElement(userConnectButton);
        showElement(userProfileButton);
        showElement(openCreateItemButton);
    } else {
        showElement(userConnectButton);
        hideElement(userProfileButton);
        hideElement(openCreateItemButton);

    }
}
//python -m http.server
login = async () => {
    try {
        await Moralis.Web3.authenticate();
        initUser();
    } catch (error) {
        alert(error)
    }
}

logout = async () => {
    await Moralis.User.logOut();
    hideElement(userInfo);
    hideElement(openCreateItemButton);
}

openUserInfo = async () => {
    user = await Moralis.User.current();
    if (user) {
        const email = user.get("email");
        if (email) {
            userEmailField.value = email;
        } else {
            userEmailField.value = "";
        }

        userUsernameField.value = user.get("username"); //dont need to validate first bc auto-assigned to account

        const userAvatar = user.get("avatar");
        if (userAvatar) {
            userAvatarImg.src = userAvatar.url();
            showElement(userAvatarImg);
        } else {
            hideElement(userAvatarImg);
        }

        showElement(userInfo);
    } else {
        login();
    }
}

saveUserInfo = async () => {
    user.set("email", userEmailField.value);
    user.set("username", userUsernameField.value);

    if (userAvatarFile.files.length > 0) {
        const avatar = new Moralis.File("avatar.jpg", userAvatarFile.files[0]); 
        user.set("avatar", avatar);
    }

    await user.save();
    alert("User info saved successfully!");
    openUserInfo();
}

createItem = async () => {
    if (createItemFile.files.length == 0) {
        alert("Please select a file!");
        return;
    } else if (createItemNameField.value.length == 0) {
        alert("Please give the item a name!");
        return;
    }

    const nftFile = new Moralis.File("nftFile.jpg", createItemFile.files[0]); // prod check file type first
    await nftFile.saveIPFS();

    const nftFilePath = nftFile.ipfs();
    const nftFileHash = nftFile.hash();

    const metadata = {
        name: createItemNameField.value,
        desc: createItemDescField.value,
        nftFilePath: nftFilePath,
        nftFileHash: nftFileHash
    };
    //alert(metadata.nftFileHash + metadata.nftFilePath);

    const nftFileMetadataFile = new Moralis.File("metadata.json", { base64: btoa(JSON.stringify(metadata)) });
    await nftFileMetadataFile.saveIPFS();

    nftFileMetadataFilePath = nftFileMetadataFile.ipfs();
    nftFileMetadataFileHash = nftFileMetadataFile.hash();

    const Item = Moralis.Object.extend("Item");

    const item = new Item();
    item.set("name", createItemNameField.value);
    item.set("desc", createItemDescField.value);
    item.set("nftFilePath", nftFilePath);
    item.set("nftFileHash", nftFileHash);
    item.set("metadataFilePath", nftFileMetadataFilePath);
    item.set("metadataFileHash", nftFileMetadataFileHash);
    await item.save();
    console.log(item);
}

hideElement = (element) => element.style.display = "none";
showElement = (element) => element.style.display = "block";

// Navbar
const userConnectButton = document.getElementById("btnConnect");
userConnectButton.onclick = login;
 
const userProfileButton = document.getElementById("btnUserInfo");
userProfileButton.onclick = openUserInfo;

const openCreateItemButton = document.getElementById("btnOpenCreateItem");
openCreateItemButton.onclick = () => showElement(createItemForm);

// User profile
const userInfo = document.getElementById("userInfo");
const userUsernameField = document.getElementById("txtUsername");
const userEmailField = document.getElementById("txtEmail");
const userAvatarImg = document.getElementById("imgAvatar");
const userAvatarFile = document.getElementById("fileAvatar");

document.getElementById("btnCloseUserInfo").onclick = () => hideElement(userInfo);
document.getElementById("btnLogout").onclick = () => logout();
document.getElementById("btnSaveUserInfo").onclick = () => saveUserInfo();

// Item creation
const createItemForm = document.getElementById("createItem");

const createItemNameField = document.getElementById("txtCreateItemName");
const createItemDescField = document.getElementById("txtCreateItemDesc");
const createItemPriceField = document.getElementById("numCreateItemPrice");
const createItemStatusField = document.getElementById("selectCreateItemStatus");
const createItemFile = document.getElementById("fileCreateItemFile");
document.getElementById("btnCloseCreateItem").onclick = () => hideElement(createItemForm);
document.getElementById("btnSaveCreateItem").onclick = () => createItem();

init();