var types = Object.keys(recipes);
let serebiiUrl = 'https://www.serebii.net/itemdex/';
let urlPostfix = '.shtml';

var inputLists = {
    "#item1": [], 
    "#item2": [], 
    "#item3": [], 
    "#item4": []
};
var sortingOptions = [
    {
        name: "Name Asc",
        function: "sortNameAsc"
    },
    {
        name: "Name Desc",
        function: "sortNameDesc"
    },
    {
        name: "Value Asc",
        function: "sortValueAsc"
    },
    {
        name: "Value Desc",
        function: "sortValueDesc"
    },
    {
        name: "Type Asc",
        function: "sortTypeAsc"
    },
    {
        name: "Type Desc",
        function: "sortTypeDesc"
    }
];

$(document).ready(function() {

    var outputSelect = $('#outputItems');
    var sortSelect = $('#sortOptions');

    $.each(sortingOptions, function(index, option){
        let newOption = $('<option />', { text: option["name"], value: option["function"]});
        sortSelect.append(newOption);
    });

    generateOptions(items, ['#item1', '#item2', '#item3', '#item4']);
	
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
            let newOption = $('<option />', { text: '<span class="' + type + " type-icon" + '">' + type + "</span> " + itemName + " (" + range[0] + "-" + range[1] + ")", value: itemName, data: item });
            outputSelect.append(newOption);
		});
    });
    $.each(fixedRecipes, function(index, fixedRecipe){
        let item = {
            name: fixedRecipe["output"],
            cost: -1,
            type: "Fixed"
        }
        let newOption = $('<option />', { text: '<span class="Fixed type-icon">Fixed</span> ' + fixedRecipe["output"] + " (3x " + fixedRecipe["input"] + ")", value: fixedRecipe["output"], data: item });
        outputSelect.append(newOption);
    });
    let blankOption = $('<option />', { text: 'Select an item', value: '', selected: true });
    outputSelect.prepend(blankOption);
	
	$('#outputItems').on("change", function() {
        let selectedItem = $('#outputItems option:selected').data();
        if(selectedItem["type"] != undefined && selectedItem["cost"] != undefined) {
            if(selectedItem["type"] == "Fixed") {
                filtered = items.filter(item => item["name"] == fixedRecipes.find(recipe => recipe["output"] == selectedItem["name"])["input"]);
                generateOptions(filtered, ['#item1', '#item3', '#item4']);
                generateOptions(items, ['#item2']);

            } else {
                filtered = items.filter(item => item["type"] == selectedItem["type"]);
                generateOptions(filtered, ['#item1']);
                generateOptions(items, ['#item2', '#item3', '#item4']);
            }
        } else {
            generateOptions(items, ['#item1', '#item2','#item3', '#item4']);
        }
        updateDisplay();
	});
	$('.dropdownSort').select2();
    $('.select2').addClass("select-border");
    $('.dropdown').select2({
        allowClear: true,
        placeholder: "Select an item",
        escapeMarkup: function(markup) {
            return markup;
        }
    }).on('select2:unselecting', function() {
        $(this).data('unselecting', true);
    }).on('select2:opening', function(e) {
        if ($(this).data('unselecting')) {
            $(this).removeData('unselecting');
            e.preventDefault();
        }
    });

	$("#item1, #item2, #item3, #item4").on("change", function() {
        updateDisplay();
    });
    
    $("#sortOptions").on("change", function() {
        let selectList = Object.keys(inputLists);
        $.each(selectList, function(index, selectKey){
            
            var selected = $(selectKey).val();
            generateOptions(inputLists[selectKey], [selectKey]);
            $(selectKey).val(selected).trigger('change');
        });
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
                itemLink += generateSerebiiLink(itemName) + (index == selectedRecipe["name"].length - 1 ? '' : ', ')
            });
            $('#desiredName').html(itemLink);
        } else {
            $('#desiredName').html(generateSerebiiLink(selectedRecipe["name"]));
        }
        if(selectedRecipe["type"] == "Fixed") {
            let desiredItem = fixedRecipes.find(recipe => recipe["output"] == selectedRecipe["name"])["input"];
            $('#desiredCost').html("3x " + generateSerebiiLink(desiredItem) + " + (Any Item)" );
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

        var apricorns = Object.keys(apricornRecipes);
        var item1 = $('#item1 option:selected').data();
        var item2 = $('#item2 option:selected').data();
        var item3 = $('#item3 option:selected').data();
        var item4 = $('#item4 option:selected').data();
        let itemVarList = [item1, item2, item3, item4];

        if(fixedRecipeInputs.includes(item1["name"]) && item3["name"] == item1["name"] && item4["name"] == item1["name"] && item2["name"] != undefined){
            var fixedOutputItem = fixedRecipes.find(recipe => recipe["input"] == item1["name"])["output"];
            $('#currentName').html(generateSerebiiLink(fixedOutputItem));
            $('#currentCost').html("3x " + generateSerebiiLink(item1["name"]) + " + " + generateSerebiiLink(item2["name"]));
        } else if(apricorns.includes(item1["name"]) && apricorns.includes(item2["name"]) && apricorns.includes(item3["name"]) && apricorns.includes(item4["name"])) {
            var outputBalls = {};
            $.each(itemVarList, function(index, item){
                $.each(apricornRecipes[item["name"]], function(index, ball){
                    let ballName = Object.keys(ball)[0];
                    if(outputBalls[ballName] == undefined) {
                        outputBalls[ballName] = 0;
                    }
                    outputBalls[ballName] += ball[ballName];
                });
            });
            $('#currentName').empty();
            var ballList = Object.keys(outputBalls);
            ballList = ballList.sort((a, b) => outputBalls[b] - outputBalls[a]);
            $.each(ballList, function(index, ballName){
                outputBalls[ballName] = outputBalls[ballName]/4;
                let classes = (index == ballList.length-1 ? '"col-6"' : '"col-6 border-bottom border-secondary"');
                newElement = $("<div />", { 
                    html: '<div class=' + classes + '>' + generateSerebiiLink(ballName) + '</div><div class=' + classes + '>' + outputBalls[ballName] + '%</div>',
                    class: 'row'
                });
                $('#currentName').append(newElement);
            });
            $('#currentCost').html("N/A");

        } else if(type != undefined && value != undefined) {
            var outputItem = recipes[type][lookupValue];
            if (Array.isArray(outputItem)){
                let itemLink = '';
                $.each(outputItem, function(index, itemName){
                    itemLink += generateSerebiiLink(itemName) + (index == outputItem.length - 1 ? '' : ', ')
                });
                $('#currentName').html(itemLink);
            } else {
                $('#currentName').html(generateSerebiiLink(outputItem));
            }
            if(range != undefined) {
                if(value >= range[0] && value <= range[1]) {
                    $('#currentCost').html(value);
                } else if(value < range[0]) {
                    $('#currentCost').html(value + " (need +" + (range[0] - value) + " to +" + (range[1] - value) + ")");
                } else if(value > range[1]) {
                    $('#currentCost').html(value + " (need -" + (value - range[0]) + " to -"  + (value - range[1]) + ")");
                }
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

function generateSerebiiLink(itemName) {
    let urlItem = itemName.toLowerCase().replace("'","").replace(" ","");
    let itemLink = '<a target=”_blank” href=' + serebiiUrl + urlItem + urlPostfix + '>' + itemName + '</a>'
    return itemLink;
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
        $('html').get(0).style.setProperty(	"--header-color", "blue");
        defaultTheme = !defaultTheme;
    } else {
        $('html').get(0).style.setProperty(	"--main-bg-color", "azure");
        $('html').get(0).style.setProperty(	"--text-color", "black");
        $('html').get(0).style.setProperty(	"--link-color", "dodgerblue");
        $('html').get(0).style.setProperty(	"--header-color", "skyblue");
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

function generateOptions(itemList, selectList) {
    generateLists(itemList, selectList);

    $.each(selectList, function(index, selectId){
        var inputList = inputLists[selectId];
        var newOption = undefined;
        $(selectId).empty();
        $.each(inputList, function(index, item){
            newOption = $("<option />", { 
                text: '<span class="' + item["type"] + " type-icon" + '">' + item["type"] + "</span> "  + item["name"] + ' (' + item["value"] + ')', 
                value: item["name"], 
                data: item });
            $(selectId).append(newOption);
        });

    });

    $.each(selectList, function(index, selectId){
        $('<option />', { text: 'Select an item', value: '', selected: true }).prependTo(selectId);
    });
}

function generateLists(itemList, selectList) {
    $.each(selectList, function(index, selectKey){
        inputLists[selectKey] = [];
        $.each(itemList, function(index, item){
            if(item["value"] < 0) {
                item["value"] = "UNK";
            }
            inputLists[selectKey].push(item);
        });
    });
    var sortFunction = $('#sortOptions option:selected').val();
    sortLists(window[sortFunction]);
}

function sortLists(sortFunction) {
    $.each(inputLists, function(index, inputList){
        inputList.sort(sortFunction);
    });
}

function sortValueAsc(a, b) {
    return a["value"] > b["value"];
}

function sortValueDesc(a, b) {
    return b["value"] > a["value"];
}

function sortNameAsc(a, b) {
    return a["name"].localeCompare(b["name"]);
}

function sortNameDesc(a, b) {
    return b["name"].localeCompare(a["name"]);
}

function sortTypeAsc(a, b) {
    return a["type"].localeCompare(b["type"]);
}

function sortTypeDesc(a, b) {
    return b["type"].localeCompare(a["type"]);
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