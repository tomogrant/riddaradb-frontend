import { Injectable } from "@angular/core";
import { IBib, PublicationType } from "./IBib";
import { IBibVm } from "./IBibVm";

@Injectable({
  providedIn: 'root',
})

export class BibMapper{

    mapDtoToVm(dto: IBib): IBibVm{

        var vm: IBibVm = {
            id: dto.id,
            publicationType: dto.publicationType,
            primarySource: false,
            recommended: dto.recommended,
            description: dto.description,
            bibliographyEntry: ""
        }

        switch (vm.publicationType){
            case PublicationType.JOURNAL_ARTICLE: 
                vm.primarySource = false;
                vm.bibliographyEntry = this.buildJournalArticle(dto);
                break;
            case PublicationType.BOOK_CHAPTER: 
                vm.primarySource = false;
                vm.bibliographyEntry = this.buildBookChapter(dto);
                break;
            case PublicationType.EDITION:
                vm.primarySource = true;
                vm.bibliographyEntry = this.buildEdition(dto);
                break;
            case PublicationType.TRANSLATION:
                vm.primarySource = true;
                vm.bibliographyEntry = this.buildTranslation(dto);
                break;
            case PublicationType.MONOGRAPH:
                vm.primarySource = false;
                vm.bibliographyEntry = this.buildMonograph(dto);
                break;
            case PublicationType.EDITED_COLLECTION:
                vm.primarySource = false;
                vm.bibliographyEntry = this.buildEditedCollection(dto);
                break;
            case PublicationType.THESIS:
                vm.primarySource = false;
                vm.bibliographyEntry = this.buildThesis(dto);
                break;
            case PublicationType.WEBSITE:
                vm.primarySource = false;
                vm.bibliographyEntry = this.buildWebsite(dto);
                break;
            case PublicationType.OTHER:
                vm.primarySource = false;
                vm.bibliographyEntry = this.buildOther(dto);
                break;
            default:
                console.log("Publication type not set!");
        }

        return vm;
    }

    buildJournalArticle(dto: IBib): string{

        var str = "";

        if (dto.authors !== ''){
            if (dto.editors === '' && dto.translators === '') {str = str + (dto.authors + ". ");}
            else { str = str + (dto.authors + ", ") }
        }
        if (dto.editors !== ''){
            if (dto.authors !== '' && dto.translators === ''){str = str + ("ed. " + dto.editors + ". ");}
            else {str = str + (dto.editors + ", ed., ");}
        }

        if (dto.translators !== ''){
            if (dto.authors !== '' && dto.editors !== ''){str = str + (dto.translators + ", trans., ");}
            else {str = str + ("tr. " + dto.translators +". ");}
        }

        str = str + ("'" + dto.title + "', ");

        str = str + ("<i>" + dto.book + " </i>");

        if (dto.volume !== ''){str = str + (dto.volume + " ");}

        str = str + ("(" + dto.publicationYear + "), ");

        str = str + (dto.pageNumbers + ".");

        return str;
    }

    buildBookChapter(dto: IBib): string{
        var str = "";

        if (dto.authors !== ''){
            if (dto.editors === '' && dto.translators === '') {str = str + (dto.authors + ". ");}
            else { str = str + (dto.authors + ", ") }
        }
        if (dto.editors !== ''){
            if (dto.authors !== '' && dto.translators === ''){str = str + ("ed. " + dto.editors + ". ");}
            else {str = str + (dto.editors + ", ed., ");}
        }

        if (dto.translators !== ''){
            if (dto.authors !== '' && dto.editors !== ''){str = str + (dto.translators + ", trans., ");}
            else {str = str + ("tr. " + dto.translators +". ");}
        }

        str = str + ("'" + dto.title + "', in ");

        str = str + (dto.bookEditors + ", ed., ");

        str = str + ("<i>" + dto.book + "</i>");

        if (dto.bookSeries !== "") {str = str + (". " + dto.bookSeries)};

        if (dto.volume !== "") {str = str + (" " + dto.volume);}

        str = str + (". " + dto.placeOfPublication + ": ");

        str = str + (dto.publisher + ", ");

        str = str + (dto.publicationYear + ", ");

        if (dto.pageNumbers.includes('-')){str = str + ("pp. " + dto.pageNumbers + ".");}
        else {(str = str + ("p. " + dto.pageNumbers + "."));}

        return str;

    }

    buildEdition(dto: IBib): string{
        var str = "";

        str = str + (dto.editors + ", ed. ");

        str = str + ("<i>" + dto.title + "</i>");

        if (dto.bookSeries !== ""){str = str + (". " + dto.bookSeries);}

        if (dto.volume !== ""){str = str + (" " + dto.volume);}

        if (dto.numOfVolumes !== ""){
            if (!Number.isNaN(Number.parseInt(dto.numOfVolumes))){
                if (Number.parseInt(dto.numOfVolumes) > 1){
                    str = str + (", " + dto.numOfVolumes + " vols");
                }
                else{
                    str = str + (", " + dto.numOfVolumes + "vol");
                }
            }
        }

        str = str + (". " + dto.placeOfPublication + ": ");

        str = str + (dto.publisher + ", ");

        str = str + (dto.publicationYear + ".");

        return str;
    }

    buildTranslation(dto: IBib){

        var str = "";

        if (dto.editors !== ""){str = str + (dto.editors + ", ed, ");}


        if (dto.editors === ""){str = str + (dto.translators + ", trans. ");}
        else {str = str + ("trans. " + dto.translators + ". ");}

        str = str + ("<i>" + dto.title + "</i>");

        if (dto.bookSeries !== ""){str = str + (". " + dto.bookSeries);}

        if (dto.volume !== ""){str = str + (" " + dto.volume);}

        if (dto.numOfVolumes !== ""){
            if (!Number.isNaN(Number.parseInt(dto.numOfVolumes))){
                if (Number.parseInt(dto.numOfVolumes) > 1){
                    str = str + (", " + dto.numOfVolumes + " vols");
                }
                else{
                    str = str + (", " + dto.numOfVolumes + "vol");
                }
            }
        }

        str = str + (". " + dto.placeOfPublication + ": ");

        str = str + (dto.publisher + ", ");

        str = str + (dto.publicationYear + ".");

        return str;
    }

    buildMonograph(dto: IBib){

        var str = "";

        str = str + (dto.authors + ". ");

        str = str + ("<i>" + dto.title + "</i>");

        if (dto.bookSeries !== ""){str = str + (". " + dto.bookSeries);}

        if (dto.volume !== ""){str = str + (" " + dto.volume);}

        if (dto.numOfVolumes !== ""){
            if (!Number.isNaN(Number.parseInt(dto.numOfVolumes))){
                if (Number.parseInt(dto.numOfVolumes) > 1){
                    str = str + (", " + dto.numOfVolumes + " vols");
                }
                else{
                    str = str + (", " + dto.numOfVolumes + "vol");
                }
            }
        }

        str = str + (". " + dto.placeOfPublication + ": ");

        str = str + (dto.publisher + ", ");

        str = str + (dto.publicationYear + ".");

        return str;
    }

    buildEditedCollection(dto: IBib){

        var str = "";

        str = str + (dto.editors + ", ed. ");

        str = str + ("<i>" + dto.title + "</i>");

        if (dto.bookSeries !== ""){str = str + (". " + dto.bookSeries);}

        if (dto.volume !== ""){str = str + (" " + dto.volume);}

        if (dto.numOfVolumes !== ""){
            if (!Number.isNaN(Number.parseInt(dto.numOfVolumes))){
                if (Number.parseInt(dto.numOfVolumes) > 1){
                    str = str + (", " + dto.numOfVolumes + " vols");
                }
                else{
                    str = str + (", " + dto.numOfVolumes + "vol");
                }
            }
        }

        str = str + (". " + dto.placeOfPublication + ": ");

        str = str + (dto.publisher + ", ");

        str = str + (dto.publicationYear + ".");

        return str;
    }

    buildThesis(dto: IBib){

        var str = "";

        str = str + (dto.authors + ". ");

        str = str + ("'" + dto.title + "'. ");

        str = str + ("Unpubl. doctoral dissertation, ")

        str = str + (dto.publisher + ", ");

        str = str + (dto.publicationYear + ".");

        return str;
    }

    buildWebsite(dto: IBib){

        var str = "";

        if (dto.authors !== ""){str = str + (dto.authors + ". ");}

        str = str + (dto.title + ". ");

        str = str + ("<i><a href='" + dto.url + "'>" +  dto.url + "</a>. </i>");

        str = str + ("Year accessed: ");

        str = str + (dto.publicationYear + ".");

        return str;
    }

    buildOther(dto: IBib){

        var str = "";

        if (dto.authors !== ''){
            if (dto.editors === '' && dto.translators === '') {str = str + (dto.authors + ". ");}
            else { str = str + (dto.authors + ", ") }
        }
        if (dto.editors !== ''){
            if (dto.authors !== '' && dto.translators === ''){str = str + ("ed. " + dto.editors + ". ");}
            else {str = str + (dto.editors + ", ed., ");}
        }

        if (dto.translators !== ''){
            if (dto.authors !== '' && dto.editors !== ''){str = str + (dto.translators + ", trans., ");}
            else {str = str + ("tr. " + dto.translators +". ");}
        }

        if (dto.title !== "") {str = str + ("'" + dto.title + "'. ");}

        if (dto.url !== "") {str = str + ("<i><a href='" + dto.url + "'>" +  dto.url + "</a>. </i>");}

        if (dto.bookEditors !== "") {str = str + (dto.bookEditors + ", ed. ");}

        if (dto.book !== "") {str = str + ("<i>" + dto.book + "</i>. ");}

        if (dto.bookSeries !== "") 
            {
                if (dto.volume !== ""){str = str + ("" + dto.bookSeries + " ")}
                else{str = str + ("" + dto.bookSeries + ". ")}

            };

        if (dto.volume !== "") {str = str + (" " + dto.volume + ". ");}

        if (dto.numOfVolumes !== ""){
            if (!Number.isNaN(Number.parseInt(dto.numOfVolumes))){
                if (Number.parseInt(dto.numOfVolumes) > 1){
                    str = str + (", " + dto.numOfVolumes + " vols. ");
                }
                else{
                    str = str + (", " + dto.numOfVolumes + "vol. ");
                }
            }
        }

        if (dto.placeOfPublication !== "") {str = str + (dto.placeOfPublication + ". ");}

        if (dto.publisher !== "") {str = str + (dto.publisher + ". ");}

        if (dto.publicationYear !== "") {str = str + (dto.publicationYear + ". ");}

        if (dto.pageNumbers !== ""){
            if (dto.pageNumbers.includes('-')){str = str + ("pp. " + dto.pageNumbers + ".");}
            else {(str = str + ("p. " + dto.pageNumbers + "."));}
        }

        return str;

    }
}   
