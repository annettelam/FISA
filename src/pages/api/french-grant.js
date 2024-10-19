document.addEventListener("DOMContentLoaded", function() {
    let coreArr = [document.getElementById("corek-half"), document.getElementById("corek-full")];
    for (let i = 1; i <= 12; i++) {
        coreArr.push(document.getElementById("coregrade".concat(i.toString())));
    }
    let immersArr = [document.getElementById("immersk-half"), document.getElementById("immersk-full")];
    for (let i = 1; i <= 12; i++) {
        immersArr.push(document.getElementById("immersgrade".concat(i.toString())));
    }

    const coreElemTotal = document.getElementById("core-elemTotal");const coreSecTotal = document.getElementById("core-secTotal");const coreTotal = document.getElementById("coreTotal");
    const immersElemTotal = document.getElementById("immers-elemTotal");const immersSecTotal = document.getElementById("immers-secTotal");const immersTotal = document.getElementById("immersTotal");

    let coreTotalsArr = [];
    let immersTotalsArr = [];
    for (let i = 1; i < 6; i++) {
        coreTotalsArr.push(document.getElementById("coreTotal".concat(i.toString())));
        immersTotalsArr.push(document.getElementById("immersTotal".concat(i.toString())));
    }
    
    function UpdateTotal() {
        
        let coreElementary = 0;
        for (let i = 0; i < 9; i++) {
            if (coreArr[i].id.includes("k-half")) coreElementary += parseFloat(coreArr[i].value) / 2 || 0;
            else coreElementary += parseInt(coreArr[i].value) || 0;
        }
        let immersElementary = 0;
        for (let i = 0; i < 9; i++) {
            if (immersArr[i].id.includes("k-half")) immersElementary += parseFloat(immersArr[i].value) / 2 || 0;
            else immersElementary += parseInt(immersArr[i].value) || 0;
        }

        let coreSecondary = 0;
        for (let i = 9; i < 14; i++) {
            coreSecondary += parseInt(coreArr[i].value) || 0;
        }
        let immersSecondary = 0;
        for (let i = 9; i < 14; i++) {
            immersSecondary += parseInt(immersArr[i].value) || 0;
        }

        const core = coreElementary + coreSecondary;
        const immers = immersElementary + immersSecondary;

        coreElemTotal.value = coreElementary;
        immersElemTotal.value = immersElementary;


        let core1, core2, core3, core4;
        let immers1, immers2, immers3, immers4;
        core1 = core2 = core3 = core4 = immers1 = immers2 = immers3 = immers4 = 0;
        for (let i = 0; i < 14; i++) {
            if (i == 0) {
                core1 += parseFloat(coreArr[i].value) / 2 || 0;
                immers1 += parseFloat(immersArr[i].value) / 2 || 0;
            } else if (i <= 4) {
                core1 += parseInt(coreArr[i].value) || 0;
                immers1 += parseInt(immersArr[i].value) || 0;
            } else if (i <= 8) {
                core2 += parseInt(coreArr[i].value) || 0;
                immers2 += parseInt(immersArr[i].value) || 0;
            } else if (i <= 11) {
                core3 += parseInt(coreArr[i].value) || 0;
                immers3 += parseInt(immersArr[i].value) || 0;
            } else {
                core4 += parseInt(coreArr[i].value) || 0;
                immers4 += parseInt(immersArr[i].value) || 0;
            }
        }
        coreTotalsArr[0].value = core1;
        coreTotalsArr[1].value = core2;
        coreTotalsArr[2].value = core3;
        coreTotalsArr[3].value = core4;
        coreTotalsArr[4].value = 0;

        immersTotalsArr[0].value = immers1;
        immersTotalsArr[1].value = immers2;
        immersTotalsArr[2].value = immers3;
        immersTotalsArr[3].value = immers4;
        immersTotalsArr[4].value = 0;

        coreSecTotal.value = coreSecondary;
        immersSecTotal.value = immersSecondary;

        coreTotal.value = core;
        immersTotal. value = immers;
    }

    let core$Arr = [];
    let corePercArr = [];
    let coreGrantArr = [];

    let immers$Arr = [];
    let immersPercArr = [];
    let immersGrantArr = [];

    for (let i = 1; i < 6; i++ ) {
        coreGrantArr.push(document.getElementById("core-grant-".concat(i.toString())));
        core$Arr.push(document.getElementById("core-fund-dollar".concat(i.toString())));
        corePercArr.push(document.getElementById("core-fund-percent".concat(i.toString())));

        immersGrantArr.push(document.getElementById("immers-grant-".concat(i.toString())));
        immers$Arr.push(document.getElementById("immers-fund-dollar".concat(i.toString())));
        immersPercArr.push(document.getElementById("immers-fund-percent".concat(i.toString())));
    }

    let grantGrandTotal = document.getElementById("grant-grand-total");

    function UpdateGrantAmount() {
        const FISA_ADMIN_FUND = parseInt(document.getElementById("fisa-admin-fee").value);
        
        let grandTotal, coreGrandTotal, immersGrandTotal;
        grandTotal = coreGrandTotal = immersGrandTotal = 0;

        for (let i = 0; i < core$Arr.length; i++) {
            let coreStudents = parseFloat(coreTotalsArr[i].value) || 0;
            let immersStudents = parseFloat(immersTotalsArr[i].value) || 0;

            let coreInstructTime = (parseFloat(corePercArr[i].value) / 100) || 0;
            let immersInstructTime = (parseFloat(immersPercArr[i].value) / 100) || 0;
            
            let coreAdjustedFTE = (coreInstructTime * coreStudents) || 0;
            let immersAdjustedFTE = (immersInstructTime * immersStudents) || 0;

            let coreFund = (coreAdjustedFTE * parseFloat(core$Arr[i].value)) || 0;
            let immersFund = (immersAdjustedFTE * parseFloat(immers$Arr[i].value)) || 0;

            coreGrantArr[i].value = coreFund;
            immersGrantArr[i].value = immersFund;

            grandTotal += (coreFund + immersFund);
            coreGrandTotal += coreFund;
            immersGrandTotal += immersFund;
        }

        grantGrandTotal.value = grandTotal + FISA_ADMIN_FUND;
        coreGrantArr[4].value = coreGrandTotal;
        immersGrantArr[4].value = immersGrandTotal;
    }

    for (let i = 0; i < coreArr.length; i++) {
        coreArr[i].addEventListener("input", UpdateTotal);
        immersArr[i].addEventListener("input", UpdateTotal);
        
        coreArr[i].addEventListener("input", UpdateGrantAmount);
        immersArr[i].addEventListener("input", UpdateGrantAmount);
    }
    for (let i = 0; i < core$Arr.length; i++) {
        core$Arr[i].addEventListener("input", UpdateGrantAmount);
        corePercArr[i].addEventListener("input", UpdateGrantAmount);
        coreGrantArr[i].addEventListener("input", UpdateGrantAmount);
        immers$Arr[i].addEventListener("input", UpdateGrantAmount);
        immersPercArr[i].addEventListener("input", UpdateGrantAmount);
        immersGrantArr[i].addEventListener("input", UpdateGrantAmount);
    }

    const button = document.getElementById("switch-button");
    let isEditable = true;

    button.onclick = () => {
        // Parent divs
        const nameParent = document.getElementById("school-name");
        const numParent = document.getElementById("school-dist-num");

        // Switch the inputs to paragraph and vice versa
        if (isEditable) {
            let name = document.getElementById("school-name-input");
            let num = document.getElementById("school-num-input");
            
            let nameText = document.createElement("p");
            let numText = document.createElement("p");

            // Assign id and text to new elements
            nameText.id = name.id;
            nameText.textContent = name.value;

            numText.id = num.id;
            numText.textContent = num.value;

            // Remove old inputs and replace with new static text
            nameParent.removeChild(name);nameParent.appendChild(nameText);
            numParent.removeChild(num);numParent.appendChild(numText);

            // Update bool
            isEditable = false;
        } else {
            let style = "border: 3px solid black; color: black; display: block;";

            let nameText = document.getElementById("school-name-input");
            let numText = document.getElementById("school-num-input");
            
            let name = document.createElement("input");
            let num = document.createElement("input");

            // Assign id and text to new elements
            name.id = nameText.id;
            name.value = nameText.textContent;
            name.style = style;

            num.id = numText.id;
            num.value = numText.textContent;
            num.style = style;

            // Remove old inputs and replace with new static text
            nameParent.removeChild(nameText);nameParent.appendChild(name);
            numParent.removeChild(numText);numParent.appendChild(num);

            // Update bool
            isEditable = true;
        }
    }
});
