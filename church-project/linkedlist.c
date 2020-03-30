//Church Project1
//hi
//Dalton Domenighi, Matt Barton, and James Seibel
#include <assert.h> //🗡💔 🤧
#include <stdbool.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include "linkedlist.h"
#ifndef LINKEDLIST_H
#define LINKEDLIST_H
#endif
/*
 * DONE
 * Create an empty list (a new Value object of type NULL_TYPE).
 */
Value *makeNull()
{
    Value *newList = malloc(sizeof(Value));
    newList->type = NULL_TYPE;
    return newList;
}

/*
 * DONE
 * Create a nonempty list (a new Value object of type CONS_TYPE).
 */
Value *cons(Value *car, Value *cdr)
{
    Value *newList = malloc(sizeof(Value));
    newList->type = CONS_TYPE;
    newList->c.car = car;
    newList->c.cdr = cdr;
    return newList;
}

/*
 * IN-PROGRESS
 * Print a representation of the contents of a linked list.
 */
void display(Value *list)
{
    printf("_____________________________\n");
    int counter = 0;
    while(!isNull(list))
    {
        //If it is not null, the node will be a CONS_TYPE
        printf("Node %d\n", counter);
        Value *theCar = list->c.car;
        switch (theCar->type)
        {
            case INT_TYPE:
                printf("\ttype: int %d\n", theCar->i);
                break;
            case DOUBLE_TYPE:
                printf("\ttype: double %lf\n", theCar->d);
                break;
            case STR_TYPE:
                printf("\ttype: char *: %s\n", theCar->s);
                break;
                //TODO anything to do with these
            default:
                break;
        }
        list = list->c.cdr;
        counter++;
    }
    printf("_____________________________\n");
}

/*
 * KINDA DONE except the assert...does that work?
 * Get the car value of a given list.
 * (Uses assertions to ensure that this is a legitimate operation.)
 */
Value *car(Value *list)
{
    //TODO assert
    return list->c.car;
}

/*
 * KINDA DONE except the assert...does that work?
 * Get the cdr value of a given list.
 * (Uses assertions to ensure that this is a legitimate operation.)
 */
Value *cdr(Value *list)
{
    //TODO assert
    return list->c.cdr;
}

/*
 * KINDA DONE except the assert...does that work?
 * Test if the given value is a NULL_TYPE value.
 * (Uses assertions to ensure that this is a legitimate operation.)
 */
bool isNull(Value *value)
{
  //TODO assert
    return(value->type == NULL_TYPE);
}

/*
 * KINDA DONE... the assert double check
 * Compute the length of the given list.
 * (Uses assertions to ensure that this is a legitimate operation.)
 */
int length(Value *value)
{
    int length = 0;
    while(!isNull(value))
    {
        length++;
        //TODO put in assert
        assert(value = value->c.cdr);
    }
    return length;
}

/*
 * DONE
 * Create a new linked list whose entries correspond to the given list's
 * entries, but in reverse order.  The resulting list is a deep copy of the
 * original: that is, there should be no shared memory between the original
 * list and the new one.
 *
 * (Uses assertions to ensure that this is a legitimate operation.)
 *
 * FAQ: What if there are nested lists inside that list?
 * ANS: There won't be for this assignment. There will be later, but that will
 *      be after we've got an easier way of managing memory.
 */
Value *reverse(Value *list)
{
    Value *reversed = makeNull();

    Value *iterator = list;
    for(int i = 0; i < length(list); i++)
    {
	Value *newCell = malloc(sizeof(Value));
	Value *theCar = iterator->c.car;
        switch (theCar->type)
        {
            case INT_TYPE:
                newCell->type = INT_TYPE;
		newCell->i = theCar->i;
                break;
            case DOUBLE_TYPE:
                newCell->type = DOUBLE_TYPE;
		newCell->d = theCar->d;
                break;
            case STR_TYPE:
                newCell->type = STR_TYPE;
		newCell->s = malloc(sizeof(theCar->s) * sizeof(char));
		strcpy(newCell->s, theCar->s);
                break;
            default:
                break;
        }
	reversed = cons(newCell, reversed);
	iterator = iterator->c.cdr;
    }
    //display(iterator);
    return reversed;
}

/*
 * IN-PROGRESS
 * Frees up all memory directly or indirectly referred to by list.
 *
 * (Uses assertions to ensure that this is a legitimate operation.)
 *
 * FAQ: What if there are nested lists inside that list?
 * ANS: There won't be for this assignment. There will be later, but that will
 *      be after we've got an easier way of managing memory.
 */
void cleanup(Value *list)
{
    //free null Value at the end of the list
    Value *iterator = list;
    for(int i = 0; i < length(list); i++)
    {
        iterator = iterator->c.cdr;
    }
    free(iterator);

    //free each cell's contents and then the cell itself
    int notfree = length(list);
    while(notfree > 0)
    {
        Value *iterator = list;
        for(int i = 0; i < notfree - 1; i++)
        {
            iterator = iterator->c.cdr;
        }
        if(iterator->c.car->type == STR_TYPE)
        {
            free(iterator->c.car->s);
        }
        free(iterator->c.car);
        free(iterator);
        notfree--;
    }
}
