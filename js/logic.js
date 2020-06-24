var types = Object.keys(recipes);
var listoutputs = '';

let serebiiUrl = 'https://www.serebii.net/itemdex/';
let urlPostfix = '.shtml';


$(document).ready(function() {
    generateOptions(items, ['#item1', '#item2', '#item3', '#item4']);

    
    var outputSelect = $('#outputItems');
	
	$.each(types, function(index, type){
		let recipeCosts = Object.keys(recipes[type]);
		$.each(recipeCosts, function(index, cost){
            let itemName = recipes[type][cost];
            let item = {
                name: itemName,
                cost: cost,
                type: type
            }
            
            let newOption = $('<option />', { text: itemName + " (" + type + ", " + cost + ")", value: itemName, data: item });
            outputSelect.append(newOption);

			// listoutputs += '<option value="' + itemName + '" data-item=' + JSON.stringify(item) + '>' + itemName + ' (' + type +  ')' + '</option>';
		});
    });
    let blankOption = $('<option />', { text: 'Select an item', value: '', selected: true });
    outputSelect.prepend(blankOption);
	// $('#outputItems').append(listoutputs);
	
	$('#outputItems').on("change", function() {
        let selectedItem = $('#outputItems option:selected').data();
        if(selectedItem["type"] != undefined) {
            filtered = items.filter(item => item["type"] == selectedItem["type"]);
            $('#item1').empty();
            generateOptions(filtered, ['#item1']);
            var urlItem = selectedItem["name"].toLowerCase().replace("'","").replace(" ","");
            $('#desiredName').html('<a target=”_blank” href=' + serebiiUrl + urlItem + urlPostfix + '>' + selectedItem["name"] + '</a>');
            $('#desiredCost').html(selectedItem["cost"]);
        } else {
            $('#item1').empty();
            generateOptions(items, ['#item1']);
            $('#desiredName').html("None");
            $('#desiredCost').html("None");
        }
	});
	
    $('.dropdown').select2();

	
	$("#item1, #item2, #item3, #item4").on("change", function() {
		var output = calcOutput();
		var value = output["value"];
		var lookupValue = output["lookupValue"];
        var type = output["type"];
        if(type != undefined) {
            var outputItem = recipes[type][lookupValue].toString();
            var urlItem = outputItem.toLowerCase().replace("'","").replace(" ","");
            console.log(type, value, lookupValue);
            $('#currentName').html('<a target=”_blank” href=' + serebiiUrl + urlItem + urlPostfix + '>' + outputItem + '</a>');
            $('#currentCost').html(value);
        } else {
            $('#currentName').html("None");
            $('#currentCost').html("None");
        }
		
	});
	
});

function sortOptions(selectList, filterParam) {
    console.log(filterParam);
    $.each(selectList, function(index, selectId){
        var sel = $(selectId);
        var selected = sel.val(); // cache selected value, before reordering
        var opts_list = sel.find('option');
        opts_list.sort(function(a, b) { 
            let paramA = $(a).data()[filterParam];
            let paramB = $(b).data()[filterParam];
            // console.log(paramA, paramB);
            paramA = paramA == "UNK" ? 0 : paramA;
            paramB = paramB == "UNK" ? 0 : paramB;
            return paramA > paramB ? -1 : 1; 
        });
        sel.empty().append(opts_list);
        sel.val(selected); // set cached selected value
    });
}

function generateOptions(itemList, selectList) {
	$.each(itemList, function(index, item){
		if(item["value"] < 0) {
			item["value"] = "UNK";
        }

        var newOption = undefined;
        $.each(selectList, function(index, selectId){
            newOption = $('<option />', { 
                text: item["name"] + ' (' + item["type"] + ', ' + item["value"] + ')', 
                value: item["name"], 
                data: item });
            $(selectId).append(newOption);
        });

    });
    $.each(selectList, function(index, selectId){
        $('<option />', { text: 'Select an item', value: '', selected: true }).prependTo(selectId);
    });
}

function calcOutput() {
	
	var type = undefined;
	var totalValue = 0;
	
	
	for(i = 1; i <=4; i++) {
        var item = $('#item' + i + ' option:selected').data();
		var value = parseInt(item["value"]);
		if(value < 0 || isNaN(value)){
			value = 0;
		}
		if(i == 1) {
			type = item["type"];
		}
		
		totalValue += value;
		
	}

	convertedValue = convertRecipeValue(totalValue);

	output = {
		"type": type,
		"value": totalValue,
		"lookupValue": convertedValue
	}
	return output;
}

function convertRecipeValue(value) {
	recipeNumber = value / 10;
	recipeNumber = Math.ceil(recipeNumber);
	recipeNumber *= 10;
	if(recipeNumber < 20) {
		recipeNumber = 20;
	}
	else if(recipeNumber > 160) {
		recipeNumber = 160;
	}
	return recipeNumber;
}