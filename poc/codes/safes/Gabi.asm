for:
mov ax, [999]
mov cx, 3
inc ax
div cx
xor ax, 0xffff
cmp ax, 65443
jz fin
jmp for
fin:
xor dx, dx
xor cx, cx 