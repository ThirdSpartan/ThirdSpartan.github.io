var types = Object.keys(recipes);
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
            let range = calcCostRange(cost);
            let newOption = $('<option />', { text: itemName + " <span class=" + type + ">" + type + "</span>" + " (" + range[0] + "-" + range[1] + ")", value: itemName, data: item });
            outputSelect.append(newOption);
		});
    });
    $.each(fixedRecipes, function(index, fixedRecipe){
        let item = {
            name: fixedRecipe["output"],
            cost: -1,
            type: "Fixed"
        }
        let newOption = $('<option />', { text: fixedRecipe["output"] + " <span class=Fixed>Fixed</span>" + " (3x " + fixedRecipe["input"] + ")", value: fixedRecipe["output"], data: item });
        outputSelect.append(newOption);
    });
    let blankOption = $('<option />', { text: 'Select an item', value: '', selected: true });
    outputSelect.prepend(blankOption);
	
	$('#outputItems').on("change", function() {
        let selectedItem = $('#outputItems option:selected').data();
        if(selectedItem["type"] != undefined && selectedItem["cost"] != undefined) {
            if(selectedItem["type"] == "Fixed") {
                filtered = items.filter(item => item["name"] == fixedRecipes.find(recipe => recipe["output"] == selectedItem["name"])["input"]);
                $('#item1').empty();
                $('#item3').empty();
                $('#item4').empty();
                generateOptions(filtered, ['#item1', '#item3', '#item4']);
                $('#item2').empty();
                generateOptions(items, ['#item2']);

            } else {
                filtered = items.filter(item => item["type"] == selectedItem["type"]);
                $('#item1').empty();
                generateOptions(filtered, ['#item1']);
                $('#item2').empty();
                $('#item3').empty();
                $('#item4').empty();
                generateOptions(items, ['#item2', '#item3', '#item4']);
            }
        } else {
            $('#item1').empty();
            $('#item2').empty();
            $('#item3').empty();
            $('#item4').empty();
            generateOptions(items, ['#item1', '#item2','#item3', '#item4']);
        }
        updateDisplay();
	});
	
    $('.dropdown').select2({
        escapeMarkup: function(markup) {
            return markup;
        }
    });

	
	$("#item1, #item2, #item3, #item4").on("change", function() {
        updateDisplay();
	});
});

function updateDisplay() {
    let selectedRecipe = $('#outputItems option:selected').data();
    var range = undefined;
    if(selectedRecipe["type"] != undefined && selectedRecipe["cost"] != undefined) {
        if (Array.isArray(selectedRecipe["name"])){
            let itemLink = '';
            $.each(selectedRecipe["name"], function(index, itemName){
                let urlItem = itemName.toLowerCase().replace("'","").replace(" ","");
                itemLink += '<a target=”_blank” href=' + serebiiUrl + urlItem + urlPostfix + '>' + itemName + (index == selectedRecipe["name"].length - 1 ? '</a>' : '</a>, ')
            });
            $('#desiredName').html(itemLink);
        } else {
            var urlItem = selectedRecipe["name"].toLowerCase().replace("'","").replace(" ","");
            $('#desiredName').html('<a target=”_blank” href=' + serebiiUrl + urlItem + urlPostfix + '>' + selectedRecipe["name"] + '</a>');
        }
        if(selectedRecipe["type"] == "Fixed") {
            $('#desiredCost').html("3x " + fixedRecipes.find(recipe => recipe["output"] == selectedRecipe["name"])["input"] + " + (Any Item)" );
        } else {
            range = calcCostRange(selectedRecipe["cost"])
            $('#desiredCost').html(range[0] + "-" + range[1]);
        }
    } else {
        $('#desiredName').html("None");
        $('#desiredCost').html("None");
    }


    var output = calcOutput();
    if(output != false){
        var value = output["value"];
        var lookupValue = output["lookupValue"];
        var type = output["type"];

        var fixedRecipeInputs = fixedRecipes.map(function(recipe, index){ 
            return recipe["input"]; 
        });
        var item1 = $('#item1 option:selected').data();
        var item2 = $('#item2 option:selected').data();
        var item3 = $('#item3 option:selected').data();
        var item4 = $('#item4 option:selected').data();

        if(fixedRecipeInputs.includes(item1["name"]) && item3["name"] == item1["name"] && item4["name"] == item1["name"] && item2["name"] != undefined){
            $('#currentName').html(item1["name"]);
            var fixedOutputItem = fixedRecipes.find(recipe => recipe["input"] == item1["name"])["output"];
            var urlItem = fixedOutputItem.toLowerCase().replace("'","").replace(" ","");
            $('#currentName').html('<a target=”_blank” href=' + serebiiUrl + urlItem + urlPostfix + '>' + fixedOutputItem + '</a>');
            $('#currentCost').html("3x " + item1["name"] + " + " + item2["name"]);
        }

        else if(type != undefined && value != undefined) {
            var outputItem = recipes[type][lookupValue];
            if (Array.isArray(outputItem)){
                let itemLink = '';
                $.each(outputItem, function(index, itemName){
                    let urlItem = itemName.toLowerCase().replace("'","").replace(" ","");
                    itemLink += '<a target=”_blank” href=' + serebiiUrl + urlItem + urlPostfix + '>' + itemName + (index == outputItem.length - 1 ? '</a>' : '</a>, ')
                });
                $('#currentName').html(itemLink);
            } else {
                var urlItem = outputItem.toLowerCase().replace("'","").replace(" ","");
                $('#currentName').html('<a target=”_blank” href=' + serebiiUrl + urlItem + urlPostfix + '>' + outputItem + '</a>');
            }
            if(range != undefined) {
                if(value >= range[0] && value <= range[1]) {
                    $('#currentCost').html(value);
                } else if(value < range[0]) {
                    $('#currentCost').html(value + "(need +" + (range[0] - value) + " to +" + (range[1] - value) + ")");
                } else if(value > range[1]) {
                    $('#currentCost').html(value + "(need -" + (value - range[0]) + " to -"  + (value - range[1]) + ")");
                }
            } else if(selectedRecipe["type"] == "Fixed") {
                $('#currentCost').html(value);
            } else {
                $('#currentCost').html(value);
            }
        } else {
            $('#currentName').html("None");
            $('#currentCost').html("None");
        }
    } else {
        $('#currentName').html("None");
        $('#currentCost').html("None");
    }

}

function reload() {
    location.reload();
}

var defaultTheme = true;
function toggleTheme() {
    if (defaultTheme) {
        $('html').get(0).style.setProperty(	"--main-bg-color", "dodgerblue");
        $('html').get(0).style.setProperty(	"--text-color", "springgreen");
        $('html').get(0).style.setProperty(	"--link-color", "yellow");
        defaultTheme = !defaultTheme;
    } else {
        $('html').get(0).style.setProperty(	"--main-bg-color", "lightgray");
        $('html').get(0).style.setProperty(	"--text-color", "black");
        $('html').get(0).style.setProperty(	"--link-color", "dodgerblue");
        defaultTheme = !defaultTheme;
    }
}

function calcCostRange(cost) {
    var minValue = 0;
    var maxValue = parseInt(cost);
    if(maxValue == 20) {
        minValue = 1;
    } else {
        minValue = maxValue - 9;
    }
    return [minValue, maxValue];
}

function sortOptions(selectList, filterParam) {
    // console.log(filterParam);
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
            newOption = $("<option />", { 
                text: item["name"]  + " <span class=" + item["type"] + ">" + item["type"] + "</span>"  + ' (' + item["value"] + ')', 
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
        if(item["value"] === undefined) {
            return false;
        }
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