var input = ["Red Milk", "Sugar", "Meat", "Chilli Sauce"];

async function getData(input) {
  var lessMoney = [];
  let listStoreHaveItem = [];
  try {
    const res = await axios(`http://localhost:3000/stores`);
    data = res.data;

    for (let i = 0; i < input.length; i++) {
      var listItem = [];
      Object.keys(data).forEach(function(storeName) {
        data[storeName].items.map(item => {
          if (item.in_store) {
            if (item.categories[0].name.includes(input[i])) {
              var infor = {
                name: storeName,
                location: data[storeName].location,
                itemInfor: [
                  {
                    itemName: item.name,
                    itemPrice: item.price
                  }
                ],
                keyword: item.keywords
              };
              listItem.push(infor);
              listStoreHaveItem.push(infor);
            }
          }
        });
      });
      var defaultPrice = listItem[0].itemInfor[0].itemPrice;
      for (let j = 1; j < listItem.length; j++) {
        if (listItem[j].itemInfor[0].itemPrice <= defaultPrice) {
          defaultPrice = listItem[j].itemInfor[0].itemPrice;
        }
      }
      for (let i = 1; i < listItem.length; i++) {
        if (listItem[i].itemInfor[0].itemPrice <= defaultPrice) {
          lessMoney.push(listItem[i]);
        }
      }
    }

    return { lessMoney, listStoreHaveItem };
  } catch (error) {
    // console.log(error);
    alert("du ma sai roi");
  }
}

// console.log(getData(input));
function groupByStore(listStoreHaveItem) {
  const newListStore = listStoreHaveItem.map(el => ({ ...el }));
  var result = [];

  //listStoreHaveItem has 30 stores
  // for each store with the same name, combine and get a new itemInfor
  newListStore.forEach(store => {
    const i = result.findIndex(el => el.name === store.name);
    if (i === -1) {
      result = [...result, store];
    } else {
      result[i].itemInfor = result[i].itemInfor.concat([store.itemInfor[0]]);
      // result[i].itemInfor.concat([store.itemInfor[0]]);
    }
  });

  return result;
}

getData(input).then(value => {
  console.log(value);
  console.log("-------------------------------------");
  console.log(groupByStore(value.listStoreHaveItem));
});
